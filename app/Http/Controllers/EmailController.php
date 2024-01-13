<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
class EmailController extends Controller
{
    public function index () {
        $users = User::all()->except(array(auth()->user()->id, 0));
        $hostname = auth()->user()->profile->EmailConfiguration->hostname;
         return view("email.email", compact("users", "hostname"));
    }
    private function _getConnection($hostName = null) {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $connection = imap_open(
            $hostName == null ?$emailConfig->hostname : $hostName,
             $emailConfig->getUsername(),
              $emailConfig->getPassword());
        return $connection;
        }
    public function getFolders($conn = null) {
        if($conn == null){
            $conn = $this->_getConnection();
        }
        $folders =imap_getmailboxes($conn, auth()->user()->profile->EmailConfiguration->hostname, "*");
        /*$folders = array_filter($folders, static function ($element) {
            return $element->attributes != 64;
        });*/
        return $folders;
    }
    private function _closeConnection($conn){
        imap_close($conn, 0);
    }
    public function decode($body) {
        if ($decoded = base64_decode($body, true)) {
            return $decoded;
        }
        if ($this->isQuotedPrintable($body)) {
            return imap_qprint($body);
        }
        return $body;
    }
    protected function isQuotedPrintable($message)
    {
        // Check for an invalid quoted printable sequence (= with non hex values following)
       return !preg_match("/=[^a-f0-9\n\r]{2}/i", $message, $matches);
    }
    function extract_body_part_path( $structure, $content_type_search = 'HTML' ) {
        /*
         * This is an example of a structure, but it's not fixed and there will be some problems if the algorithm to find the content is not implemented correctly
         * The structure will change if the e-mail is forwarded, reply, has attachments and so on.
         * In my case, I only need the HTML
         * Under testing, this method might take 0.000 to 0.001 seconds
        0 multipart/mixed
            1 multipart/alternative
                1.1 text/plain
                1.2 text/html
            2 message/rfc822
                2 multipart/mixed
                    2.1 multipart/alternative
                        2.1.1 text/plain
                        2.1.2 text/html
                    2.2 message/rfc822
                        2.2 multipart/alternative
                            2.2.1 text/plain
                            2.2.2 text/html
        */
    
        $iter = new \RecursiveIteratorIterator(
            new \RecursiveArrayIterator( $structure ),
            \RecursiveIteratorIterator::SELF_FIRST );
    
        foreach ( $iter as $key => $value ) {
            if ( $value === $content_type_search ) {
    
                $keys          = array();
                $encoding_type = $iter->getSubIterator()->getArrayCopy()['encoding'];
               
                for ( $i = $iter->getDepth() - 1; $i >= 0; $i -- ) {
                    //add each parent key, this is what we need
                    $path_element = $iter->getSubIterator( $i )->key();
                    $subtype = $iter->getSubIterator($i)->getArrayCopy();
                    if ( is_numeric( $path_element ) ) { // if it's not numeric, we don't need it.
                        array_unshift( $keys, ( $path_element + 1 ) );
                    }
                }
    
                //return our output array
                return array( 'path' => implode( '.', $keys ), 'encoding' => $encoding_type );
            }
        }
    
        //return false if not found, but will have exception for ->parts when is_null()
        return false;
    }
    function getImageParameters($structure, $content_type_search = "PNG") {
        $iter = new \RecursiveIteratorIterator(
            new \RecursiveArrayIterator( $structure ),
            \RecursiveIteratorIterator::SELF_FIRST );
        foreach ( $iter as $key => $value ) {
                if ( $value === $content_type_search ) {
        
                    $parameters = $iter->getSubIterator()->getArrayCopy()['parameters'];
        
                    //return our output array
                    return array( 'parameters' => $parameters );
                }
            }
    }
    function extract_body_part_path_exception( $structure, $structure_result, $content_type = 'HTML' ) {
        // if the encoding exists but the path is missing
        // then the structure must be missing the parts parameter and the HTML part is the first depth;
        // if the encoding is not empty(it can be zero), then we found the parameter subtype = 'HTML'
        if ( empty( $structure_result['path'] ) && '' !== $structure_result['encoding'] ) {
            if ( isset( $structure->subtype ) && $content_type === $structure->subtype ) {
                $structure_result['path'] = '1'; // remember, the path must be a string, not numeric
    
                return $structure_result;
            }
        } elseif ( ! empty( $structure_result['path'] ) && '' !== $structure_result['encoding'] ) {
            return $structure_result;
        } else {
            return false;
            // something is wrong, this e-mail does not contain the HTML structure,
            // you might want to add it to a log and ignore this e-mail processing further
        }
    }
    
    function your_decoding_method( $content, $get_content_type ) {
        //... Decoding email content code ...
        switch ($get_content_type){
            case 0:
                return $content;
            case 1:
                return $content;
            case 2:
                return $content;
            case 3:
                return imap_base64($content);
            case 4:
                return $this->convertX(quoted_printable_decode($content));
            case 5:
                return $this->convertX($content);
        }
        return $this->convertX($content);
    }
    function convertX($text){
        return $text;
    }
    public function getImageFromParameters($params) {
        try {
            if(is_object($params["parameters"])){
                dd($params);
            }
            return $params["parameters"][0]->value;
        }
        catch (\Exception $ex) {
        }
    }
    
    public function runTest($imap_connection, $email_number, $iterator) {
        $structure            = imap_fetchstructure( $imap_connection, $email_number );
        $headerInfo = imap_headerinfo($imap_connection, $email_number);
        $structure_path       = $this->extract_body_part_path( $structure ); // second parameter is by default set to HTML, you can search anything else also ( PLAIN, HTML, MIXED ... )
        $image_structure_path = $this->extract_body_part_path( $structure, "PNG");
        $headerInfo->subject = mb_convert_encoding(quoted_printable_decode($headerInfo->subject), 'UTF-8', 'UTF-8');
        if($structure_path == null) {
            $content = $this->your_decoding_method(imap_fetchbody( $imap_connection, $email_number, 1.0), $structure->encoding);
            if($content == null || $content == "") {
                dd($structure); 
            }
            return (object)[
                "messageNumber" => $email_number,
                "message" => mb_convert_encoding($content, 'UTF-8', 'UTF-8'),
                "attachments" => null,
                "header" => $headerInfo
            ];
            
            
        }
        $structure_path_final = $this->extract_body_part_path_exception( $structure, $structure_path ); // original streucture $structure, result of the first search for path $structure_path.
        
        // use of end result
        //echo $structure_path_final['path']; // result example '1.2', '2.1.2'...
        //echo "ENC = ".$structure_path_final['encoding']; // integer value 0, 1, 2...

            $email_html_content = imap_fetchbody( $imap_connection, $email_number, $structure_path_final['path'] );

        $attachments = null;
        $content            = $this->your_decoding_method( $email_html_content, (int) $structure_path_final['encoding'] );
        if( property_exists($structure, "parts")){
            $attachments = $this->_downloadAttachments($structure, $imap_connection, $email_number);
        }
        if($image_structure_path != null && $structure_path_final['encoding'] != 0){
            $emailImageContent = imap_fetchbody( $imap_connection, $email_number, $image_structure_path['path'] );
            if($emailImageContent == null) dd($emailImageContent, $image_structure_path);
            $content = preg_replace('/[s][r][c][=]["][c][i][d][:](.*)["]/', "src='data:image/png;base64, $emailImageContent'", $content);
        }
        if($content == null) dd($structure, imap_body($imap_connection, $email_number), $structure_path, $structure_path_final);
        return (object)[
            "messageNumber" => $email_number,
            "message" => mb_convert_encoding($content, 'UTF-8', 'UTF-8'),
            "attachments" => $attachments,
            "header" => $headerInfo
        ];
    }
    private function _get_decode_value($message, $encoding) {
        switch($encoding) {
            case 0:case 1:$message = imap_8bit($message);break;
            case 2:$message = imap_binary($message);break;
            case 3:case 5:$message=imap_base64($message);break;
            case 4:$message = imap_qprint($message);break;
        }
        return $message;
    }
    private function _downloadAttachments($structure, $conn, $mailNumber) {
        $arrFileDownload = [];
        $message = array();
        $message["attachment"]["type"][0] = "text";
        $message["attachment"]["type"][1] = "multipart";
        $message["attachment"]["type"][2] = "message";
        $message["attachment"]["type"][3] = "application";
        $message["attachment"]["type"][4] = "audio";
        $message["attachment"]["type"][5] = "image";
        $message["attachment"]["type"][6] = "video";
        $message["attachment"]["type"][7] = "other";
            $parts = $structure->parts;
        $fpos=2;
        for($i = 1; $i < count($parts); $i++) {
            $header = imap_headerinfo($conn, $mailNumber);
            $message['pid'][$i] = ($i);
            $part = $parts[$i];

            if(property_exists($part, 'disposition')){

                if($part->disposition=="attachment" || $part->disposition=="ATTACHMENT") {

                    $message["type"][$i] = $message["attachment"]["type"][$part->type] . "/" . strtolower($part->subtype);
                    $message["subtype"][$i] = strtolower($part->subtype);

                    $ext = $part->subtype;
                    if(property_exists($part, "dparameters")){
                    
                        $params = $part->dparameters;
                        $filename = mb_decode_mimeheader ($part->dparameters[0]->value);
                        $body="";$data="";
                            $body = imap_fetchbody($conn, $mailNumber, $fpos);
                        $dst = "/mail/attachments/{$filename}";

                        /* don't overwrite */
                        if(!file_exists($dst)){
                            $data = $this->_get_decode_value($body, $part->type);
                            Storage::disk('public')->put($dst,$data);
                            $arrFileDownload[]=$dst;
                        }
                    }
                    $fpos++;
                }
            }
        }
        return $arrFileDownload;
    }
    public function getMailbox($folderId, $orderBy = "DESC", $startPosition = 1, $endPosition = 20, $conn = null){
        if($conn == null){
            $conn = $this->_getConnection();
        }
        $arrFolder = $this->getFolders($conn);
        $this->_closeConnection($conn);
        $conn = $this->_getConnection($arrFolder[$folderId]->name);
        $sortOrder = imap_sort($conn, SORTARRIVAL, $orderBy == "DESC" ? 1: 0 );
        $arrLength = count($sortOrder);
        if($arrLength > (($endPosition+1)-$startPosition)){
            if($arrLength > $endPosition){
                $sortOrder = array_splice($sortOrder, $startPosition-1, $endPosition);
            } else {
                $sortOrder = array_splice($sortOrder, 0, (($endPosition+1)-$startPosition));
            }
        }
        $result = [];
        $i = 0;
        foreach($sortOrder as $mailCode){
            $result[]= $this->runTest($conn, $mailCode,$i);
            $i++;
        }
        
        return $result;
    }
}
