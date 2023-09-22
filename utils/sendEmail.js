
import nodemailer from 'nodemailer'

const sendEmail = async (options)=>{
      
      process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });


      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        html: options.message,
      
      }

      await transporter.sendMail(mailOptions)

}

export default sendEmail