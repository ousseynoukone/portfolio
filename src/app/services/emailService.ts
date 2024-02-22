// email-sender.service.ts
import { Injectable } from '@angular/core';
import { Email } from '../models/email';
import { emailJsPublicKey, receiverEmail } from '../constent/constant';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailSenderService {
    
    
  sendEmail(email: Email): Promise<any> {

    emailjs.init({
        publicKey: emailJsPublicKey,
        blockHeadless: true,
        // blockList: {
        //   list: ['foo@emailjs.com', 'bar@emailjs.com'],
        // },
        limitRate: {
          throttle: 1, // 10s
        },
      });
    return  emailjs.send('service_portfolio', 'template_zjr3afe', {
        from_name: `${email.prenom} ${email.nom}`,
        number: email.phone,
        email: email.email,
        message: email.message,
        reply_to: receiverEmail,
      })
  }
}
