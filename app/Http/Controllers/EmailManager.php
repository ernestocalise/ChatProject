<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpImap;
class EmailManager extends Controller
{
    public static function GetFolders () {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $mailbox = new PhpImap\Mailbox(
            $emailConfig->hostname, // IMAP server and mailbox folder
            $emailConfig->getUsername(), // Username for the before configured mailbox
            $emailConfig->getPassword(), // Password for the before configured username
            __DIR__, // Directory, where attachments will be saved (optional)
            'UTF-8', // Server encoding (optional)
            true, // Trim leading/ending whitespaces of IMAP path (optional)
            true // Attachment filename mode (optional; false = random filename; true = original filename)
        ); 
        $mailbox->setConnectionArgs(
            CL_EXPUNGE // expunge deleted mails upon mailbox close
             // don't do non-secure authentication
        );
        try {
            // Get all emails (messages)
            // PHP.net imap_search criteria: http://php.net/manual/en/function.imap-search.php
            $folders = $mailbox->getMailboxes();
            return $folders;
            
        } catch(PhpImap\Exceptions\ConnectionException $ex) {
            echo "IMAP connection failed: " . implode(",", $ex->getErrors('all'));
            die();
        }
    }
    public static function IsMailConfigurationValid() {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $mailbox = new PhpImap\Mailbox(
            $emailConfig->hostname, // IMAP server and mailbox folder
            $emailConfig->getUsername(), // Username for the before configured mailbox
            $emailConfig->getPassword(), // Password for the before configured username
            __DIR__, // Directory, where attachments will be saved (optional)
            'UTF-8', // Server encoding (optional)
            true, // Trim leading/ending whitespaces of IMAP path (optional)
            true // Attachment filename mode (optional; false = random filename; true = original filename)
        ); 
        $mailbox->setConnectionArgs(
            CL_EXPUNGE // expunge deleted mails upon mailbox close
             // don't do non-secure authentication
        );
        try {
            // Get all emails (messages)
            // PHP.net imap_search criteria: http://php.net/manual/en/function.imap-search.php
           
            $imapStream = $mailbox->getImapStream();
            return json_encode((object)[
                "status" => true
            ]);
            
        } catch(\Exception $ex) {
            return json_encode((object)[
                "status" => false,
                "error" => $ex
            ]);
        }
    }
    public function RunTests () {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $mailbox = new PhpImap\Mailbox(
            "{pop.securemail.pro:993/imap/ssl/novalidate-cert}INBOX", // IMAP server and mailbox folder
            $emailConfig->getUsername(), // Username for the before configured mailbox
            $emailConfig->getPassword(), // Password for the before configured username
            __DIR__, // Directory, where attachments will be saved (optional)
            'UTF-8', // Server encoding (optional)
            true, // Trim leading/ending whitespaces of IMAP path (optional)
            false // Attachment filename mode (optional; false = random filename; true = original filename)
        );
        $mailbox->setAttachmentsDir("storage/mails/attachments/");
        //$mailbox->setAttachmentsIgnore(true);
        // set some connection arguments (if appropriate)
        $mailbox->setConnectionArgs(
            CL_EXPUNGE // expunge deleted mails upon mailbox close
             // don't do non-secure authentication
        );
        
        try {
            // Get all emails (messages)
            // PHP.net imap_search criteria: http://php.net/manual/en/function.imap-search.php
            $mailsIds = $mailbox->searchMailbox();
        } catch(PhpImap\Exceptions\ConnectionException $ex) {
            echo "IMAP connection failed: " . implode(",", $ex->getErrors('all'));
            die();
        }
        
        // If $mailsIds is empty, no emails could be found
        if(!$mailsIds) {
            die('Mailbox is empty');
        }
        $mailsIds = array_reverse($mailsIds);
        // Get the first message
        // If '__DIR__' was defined in the first line, it will automatically
        // save all attachments to the specified directory
        $mail = $mailbox->getMail($mailsIds[0]);
        

        // Print all information of $mail
        if($mail->textHtml){
            dd($mail->textHtml);
        } else {
            dd($mail->textPlain);
        }
        dd($mail);
        
        // Print all attachements of $mail
        echo "\n\nAttachments:\n";
        print_r($mail->getAttachments());
    }
}
