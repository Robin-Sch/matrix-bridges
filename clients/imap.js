const Imap = require('imap');
const {simpleParser} = require('mailparser');

const IMAP_CONFIG = JSON.parse(process.env.IMAP_CONFIG) || [];

const getEmails = () => {
	return new Promise((resolve, reject) => {
		const emails = [];
		let done = 0;
		
		for(let i = 0; i < IMAP_CONFIG.length; i++) {
			const config = IMAP_CONFIG[i];
			const imap = new Imap(config);
			
			imap.once('ready', () => {
				imap.openBox('INBOX', false, () => {
					imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
						if (results.length === 0) {
							done += 1;
							if (done === IMAP_CONFIG.length) resolve(emails);
						} else {
							const f = imap.fetch(results, {bodies: ''});
							f.on('message', msg => {
								msg.on('body', stream => {
									simpleParser(stream, async (err, parsed) => {
										const { from: { text: from }, to: { text: to }, subject, text } = parsed;
										emails.push({ from, to, subject, text});
									});
								});
								msg.once('attributes', attrs => {
									const { uid } = attrs;
									imap.addFlags(uid, ['\\Seen']);
								});
							});
							f.once('error', err => {
								console.log(err)
							});
							f.once('end', () => {
								imap.end();
							});
						};
					});
				});
			});
			
			imap.once('error', err => {
				console.log(err);
			});
			
			imap.once('end', () => {
				done += 1;
				if (done === IMAP_CONFIG.length) resolve(emails);
			});
			
			imap.connect();
		}
	});
};

module.exports = { getEmails };