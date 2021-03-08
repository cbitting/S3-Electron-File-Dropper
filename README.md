# An AWS S3 Electron File Dropper in Electron
I'm always uploading files to S3 and want the public link. This little electron app will allow drag & drop uploads, then you get a copy of the url. Hope you find it useful!

Features:
- Multiple file uploads at the same
- CDN support (config allows domain name swap)
- Progress shown for larger files

Setup:
- Clone this repo
- Run "npm i" to get all the packages
- Create your own config.json (sample config shown)
- Run "npm run start" to launch a debug version

**Warning:** By default I have the ACL to be public: ACL: 'public-read' - **This will make your uploaded files public!** -Change if you don't want this.

