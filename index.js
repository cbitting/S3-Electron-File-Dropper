const { clipboard } = require('electron')
const fs = require('fs')
const AWS = require('aws-sdk')
const mime = require('mime')
var path = require('path')

//load config file
const config_data = require('./config.json')

const s3 = new AWS.S3({
    accessKeyId: config_data.AWS_ID,
    secretAccessKey: config_data.AWS_SECRET,
})
const cdnUrl = (uploadedLink) => {
    //swap w/ CDN if using
    if (config_data.cdnDomain) {
        const myURL = new URL(uploadedLink)
        myURL.host = config_data.cdnDomain
        return myURL.href
    }
}
const addUploadToList = (uploadedLink) => {
    var liNode = document.createElement('li') // Create the li node
    var txtNode = document.createTextNode(cdnUrl(uploadedLink)) // Create a text node
    liNode.addEventListener(
        'click',
        function (e) {
            console.log('clicked: ' + cdnUrl(uploadedLink)) //for debugging of course
            clipboard.writeText(cdnUrl(uploadedLink)) //copy to clipboard
        },
        false
    )
    liNode.appendChild(txtNode) // Append the text to li
    document.getElementById('uploadedList').appendChild(liNode)
}
const updateProgress = (file, progress) => {
    if (file) {
        var prog = parseInt((progress.loaded * 100) / progress.total) + '%'
        document.getElementById('progress').innerHTML = file + ' ' + prog
    } else {
        document.getElementById('progress').innerHTML = '' //reset if blank
    }
}
const uploadFile = (fileName) => {
    let mimetype = mime.getType(path.extname(fileName)) //get the mime so S3 doesn't just force download
    let s3filename = path.basename(fileName)

    const fileContent = fs.readFileSync(fileName)

    const params = {
        Bucket: config_data.BUCKET_NAME,
        Key: s3filename,
        Body: fileContent,
        ContentType: mimetype,
        ACL: 'public-read', //WARNING - MAKE SURE YOU WANT THIS - MAKES YOUR FILE PUBLIC
    }

    // upload file to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            throw err
        }
        console.log('File uploaded successfully. ${data.Location}') //debugging
        updateProgress(null, null) //reset label
        addUploadToList(data.Location)
    }).on('httpUploadProgress', function (progress) {
        updateProgress(s3filename, progress)
    })
}

document.addEventListener('drop', (event) => {
    document.getElementById('main').style.backgroundColor = '#ffffff'
    event.preventDefault()
    event.stopPropagation()

    for (const f of event.dataTransfer.files) {
        console.log('File Path of dragged files: ', f.path) //debugging
        uploadFile(f.path)
    }
})

document.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.stopPropagation()
})

document.addEventListener('dragenter', (event) => {
    console.log('File is in the Drop Space') //debugging
    document.getElementById('main').style.backgroundColor = '#d48664'
})

document.addEventListener('dragleave', (event) => {
    console.log('File has left the Drop Space') //debugging
    document.getElementById('main').style.backgroundColor = '#fff'
})
