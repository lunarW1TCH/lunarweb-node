import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createTransport } from 'nodemailer';
import { body, validationResult } from 'express-validator';
import cors, { CorsOptions } from 'cors';
import IMailData from './MailData';
// dotEnvExtended.load();

const PORT = process.env.PORT as string;
const MAIL_FROM = process.env.MAIL_FROM as string;
const MAIL_TO = process.env.MAIL_TO as string;
const PASS = process.env.PASS as string;

const transporter = createTransport({
  service: 'outlook',
  port: 465,
  auth: {
    user: MAIL_FROM,
    pass: PASS,
  },
});

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://lunarweb.netlify.app');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post(
  '/mail',
  [
    body('email').trim().isEmail(),
    body('title').trim().not().isEmpty(),
    body('message').trim().not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const mailData = req.body as IMailData;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Incorrect data' });
    } else {
      const mailOptions = {
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: mailData.title,
        text: `From: ${mailData.email},
        ${mailData.message}
        `,
      };

      transporter.sendMail(mailOptions, err => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Sending mail failed!' });
        }
      });

      res.json({ mailData });
    }
  }
);

app.get('/', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Test' });
});

app.listen(parseInt(PORT));
