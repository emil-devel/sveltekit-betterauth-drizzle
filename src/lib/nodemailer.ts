import nodemailer from 'nodemailer';
// import { SEND_MAIL_FROM, SEND_MAIL_HOST, SEND_MAIL_PORT, SEND_MAIL_PASS, SEND_MAIL_USER } from '$env/static/private'
import { SEND_MAIL_FROM, SEND_MAIL_HOST, SEND_MAIL_PORT } from '$env/static/private';

import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
	host: SEND_MAIL_HOST as string,
	port: Number(SEND_MAIL_PORT),
	// secure: true,
	secure: false

	// auth: {
	//   user: SEND_MAIL_USER as string,
	//   pass: SEND_MAIL_PASS as string,
	// },
} as SMTPTransport.Options);

export async function sendEmail({
	to,
	subject,
	text
}: {
	to: string;
	subject: string;
	text: string;
}) {
	try {
		await transporter.sendMail({
			from: SEND_MAIL_FROM as string,
			to,
			subject,
			html: `<p>${text}</p>`
		});
		return { success: true };
	} catch (error) {
		console.error('sendMail: ', error);
		return { success: false };
	}
}
