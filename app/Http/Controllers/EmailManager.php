<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpImap;
use App\Models\EmailsDownloaded;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
class EmailManager extends Controller
{
    public const MAILBOX_CRITERIA_ALL = "ALL";
    public const MAILBOX_CRITERIA_ANSWERED = "ANSWERED";
    public const MAILBOX_CRITERIA_BCC = "BCC";
    public const MAILBOX_CRITERIA_BEFORE = "BEFORE";
    public const MAILBOX_CRITERIA_BODY = "BODY";
    public const MAILBOX_CRITERIA_CC = "CC";
    public const MAILBOX_CRITERIA_DELETED = "DELETED";
    public const MAILBOX_CRITERIA_FLAGGED = "FLAGGED";
    public const MAILBOX_CRITERIA_FROM = "FROM";
    public const MAILBOX_CRITERIA_KEYWORD = "KEYWORD";
    public const MAILBOX_CRITERIA_NEW = "NEW";
    public const MAILBOX_CRITERIA_OLD = "OLD";
    public const MAILBOX_CRITERIA_ON = "ON";
    public const MAILBOX_CRITERIA_RECENT = "RECENT";
    public const MAILBOX_CRITERIA_SEEN = "SEEN";
    public const MAILBOX_CRITERIA_SINCE = "SINCE";
    public const MAILBOX_CRITERIA_SUBJECT = "SUBJECT";
    public const MAILBOX_CRITERIA_TEXT = "TEXT";
    public const MAILBOX_CRITERIA_TO = "TO";
    public const MAILBOX_CRITERIA_UNANSWERED = "UNANSWERED";
    public const MAILBOX_CRITERIA_UNDELETED = "UNDELETED";
    public const MAILBOX_CRITERIA_UNFLAGGED = "UNFLAGGED";
    public const MAILBOX_CRITERIA_UNKEYWORD = "UNKEYWORD";
    public const MAILBOX_CRITERIA_UNSEEN = "UNSEEN";

    /* SETUP */
    public static function GetMailboxObject() {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $mailbox = new PhpImap\Mailbox(
            $emailConfig->hostname, // IMAP server and mailbox folder
            $emailConfig->getUsername(), // Username for the before configured mailbox
            $emailConfig->getPassword(), // Password for the before configured username
            "storage/mails/attachments/", // Directory, where attachments will be saved (optional)
            'UTF-8', // Server encoding (optional)
            true, // Trim leading/ending whitespaces of IMAP path (optional)
            true // Attachment filename mode (optional; false = random filename; true = original filename)
        ); 
        $mailbox->setConnectionArgs(
            CL_EXPUNGE // expunge deleted mails upon mailbox close
             // don't do non-secure authentication
        );
        return $mailbox;
    }
    public static function checkMailConfigurationIsValidByMailbox(PhpImap\Mailbox $mailbox) {
        try {
            $imapStream = $mailbox->getImapStream();
            return true;
        } catch(\Exception $ex) {
            return false;
        }
    }
    /* END SETUP */

    /* FOLDERS RELATED */
    public static function getFolderByMailBoxObject(PhpImap\Mailbox $mailbox){
        try {
            $folders = $mailbox->getMailboxes();
            return $folders;
        } catch(PhpImap\Exceptions\ConnectionException $ex) {
            echo "IMAP connection failed: " . implode(",", $ex->getErrors('all'));
            die();
        }
    }
    /* END FOLDERS RELATED */

    /* MAIL NUMBER RELATED */
    public static function getMailIndexesByMailBoxObject(PhpImap\Mailbox $mailbox, $criteria, $userFilters) {
        $outputCriteria = "";
        switch($criteria){
            case EmailManager::MAILBOX_CRITERIA_ALL:
                $outputCriteria = EmailManager::MAILBOX_CRITERIA_ALL;
            break;
        }

        return $mailbox->searchMailbox($outputCriteria);
    }
    /* END MAIL NUMBER RELATED */

    /* MAILS RELATED */
    public static function getMailByMailboxObject(PhpImap\Mailbox $mailbox, $index) {
        $mail = $mailbox->getMail($index, false);
        $mail->embedImageAttachments();
        $mail->mailIndex = $index;
        $mail->mailTextContent = $mail->textPlain;
        if($mail->textHtml){
            $mail->mailContent = $mail->textHtml;
        } else {
            $mail->mailContent = $mail->textPlain;
        }
        $mail->attachmentsPath = []; 
        foreach($mail->getAttachments() as $attachment){
            $mail->attachmentsPath[]=$attachment->name;
        }
        return $mail;
    }
    public static function getMailsByMailboxObject(PhpImap\Mailbox $mailbox, $mailIndexes, $startIndex, $endIndex) {
        $mailExtracted = [];
        if(count($mailIndexes) < $startIndex){
            return false;
        }
        if(count($mailIndexes) < $endIndex){
            $endIndex = count($mailIndexes);
        }
        for($i = $startIndex; $i < $endIndex; $i++){
            $index = $mailIndexes[$i];
            if(EmailsDownloaded::where('user_id', '=', auth()->user()->id)->where('msg_number', '=', $index)->exists()){
                $mail = EmailsDownloaded::where('user_id', '=', auth()->user()->id)->where('msg_number', '=', $index)->first();
                $mailExtracted[]=json_decode($mail->json);
            } else {
                $mailDownloaded=EmailManager::getMailByMailboxObject($mailbox, $index);
                $newRecord = new EmailsDownloaded();
                $newRecord->user_id = auth()->user()->id;
                $newRecord->msg_number = $index;
                $newRecord->json = json_encode($mailDownloaded);
                $newRecord->save();
                $mailExtracted[]=$mailDownloaded;
            }
        }
        return $mailExtracted;
    }
    /* END MAILS RELATED */

    /* EXPOSED FUNCTION */
    public static function GetMails(Request $request) {
        $data = $request->validate([
            "mailIndexes" => "required|array",
            "mailbox" => "required|string"
        ]);
        $mailBox = EmailManager::GetMailboxObject();
        $mailBox->switchMailbox($data["mailbox"]);
        return EmailManager::getMailsByMailboxObject($mailBox, $data["mailIndexes"], 0, count($data["mailIndexes"])-1);
    }
    public static function SwitchFolder(Request $request) {
        $data = $request->validate([
            "mailbox" => "required|string"
        ]);
        $mailBox = EmailManager::GetMailboxObject();
        $mailBox->switchMailbox($data["mailbox"]);
        $mailIndexes = array_reverse(EmailManager::getMailIndexesByMailBoxObject($mailBox, EmailManager::MAILBOX_CRITERIA_ALL, null));
        $mailExtracted = EmailManager::getMailsByMailboxObject($mailBox, $mailIndexes, 0, 75);
            return (object)[
                "count" => count($mailIndexes),
                "mailIndexes" => $mailIndexes,
                "currentFolder" => $data["mailbox"],
                "mails" => $mailExtracted,
                "startIndex" => 0,
                "endIndex" => 25
            ];
    }
    public static function InitializeEmail() {
        $mailbox = EmailManager::GetMailboxObject();
        if($mailbox == null){
            die("Mailbox is null");
        }
        $mailbox->setAttachmentsIgnore(false);
        $mailbox->setAttachmentsDir("storage/mails/attachments/");
        if(EmailManager::checkMailConfigurationIsValidByMailbox($mailbox)){
            $folders = EmailManager::getFolderByMailBoxObject($mailbox);
            $mailbox->switchMailbox($folders[0]["fullpath"]);
            $mailIndexes = EmailManager::getMailIndexesByMailBoxObject($mailbox, EmailManager::MAILBOX_CRITERIA_ALL, null);
            $mailIndexes = array_reverse($mailIndexes);
            $mailExtracted = EmailManager::getMailsByMailboxObject($mailbox, $mailIndexes, 0, 75);
            return (object)[
                "folders" => $folders,
                "count" => count($mailIndexes),
                "mailIndexes" => $mailIndexes,
                "currentFolder" => $folders[0],
                "mails" => $mailExtracted,
                "startIndex" => 0,
                "endIndex" => 25
            ];
        } else {
            return -1;
        }
        
    }
    public static function SendEmail(Request $request) {

        $data = $request->validate([
            "to" => "required|string",
            "subject" => "required|string",
            "cc" => "string",
            "ccn" => "string",
            "message" => "required|string"
        ]);

        $to = $data["to"];
        $cc = $data["cc"] || null;
        $ccn = $data["ccn"] || null;
        $message = $data["message"];
        $subject = $data["subject"];
        $mail = new PHPMailer(true);
        $emailConfig = auth()->user()->profile->EmailConfiguration;

        $mail->isSMTP();
        $mail->Host = "authsmtp.securemail.pro";
        $mail->SMTPAuth = true;
        $mail->Username = $emailConfig->getUsername();
        $mail->Password = $emailConfig->getPassword();
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 25;

        // Sender information
        $mail->setFrom($emailConfig->getUsername(), auth()->user()->name);
        $mail->addAddress($emailConfig->getUsername());
        $toAddresses = explode(";", $to);
        foreach($toAddresses as $address) {
            $mail->addReplyTo($address, $address); 
        }
        // if($cc != null){
        //     $ccAddresses = explode(";", $cc);
        //     foreach($ccAddresses as $address) {
        //         $mail->addCC($address, $address); 
        //     }
        // }
        // if($ccn != null){
        //     $ccnAddresses = explode(";", $ccn);
        //     foreach($ccnAddresses as $address) {
        //         $mail->addBCC($address, $address); 
        //     }
        // }
$mail->isHTML(true);

$mail->Subject = $subject;

$mail->Body    = $message;
// Attempt to send the email
if (!$mail->send()) {
    return (object) [
        "status" => -1,
        "message" => $mail->ErrorInfo
    ];
} else {
    return (object) [
        "status" => 0,
        "message" => "OK"
    ];
}

    }
    public static function IsMailConfigurationValid() {
        $emailConfig = auth()->user()->profile->EmailConfiguration;
        $mailbox = new PhpImap\Mailbox(
            $emailConfig->hostname, // IMAP server and mailbox folder
            $emailConfig->getUsername(), // Username for the before configured mailbox
            $emailConfig->getPassword(), // Password for the before configured username
            "storage/mails/attachments/", // Directory, where attachments will be saved (optional)
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
    /* END EXPOSED FUNCTIONS*/
}
