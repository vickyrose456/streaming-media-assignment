const fs = require('fs');
// path module is a collection of utilities for working w/ files & paths
const path = require('path');

const loadMedia = (request, response, file) =>
{
    fs.stat(file, (err, stats) => {
        if (err) {
          // Error no entry -> Then the file couldnt be found
          if (err.code === 'ENOENT') {
            response.writeHead(404);
          }
          return response.end(err);
        }// end if(err)
    
        let { range } = request.headers; // ES6 JS destructuring assignment.. Grabs the
        // range element from header and stores it into a variable, range
    
        if (!range) {
          // could also send a 416 error
          range = 'bytes=0-';
        }
    
        const positions = range.replace(/bytes=/, '').split('-');
    
        let start = parseInt(positions[0], 10); // parse the first position w/ base 10
    
        const total = stats.size; // total size in bytes
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    
        if (start > end) {
          start = end - 1;
        }
    
        /*
            Determine how many bytes we are sening back to the browser
            We need to send back 206 success code
        */
    
        const chunkSize = (end - start) + 1;
    
        response.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${total}`, // how much were sending out of the total
          'Accept-Ranges': 'bytes', // what type of data to expect the range in
          'Content-Length': chunkSize, // tells how big the chunk is in bytes
          'Content-Type': 'Video/mp4', // encoding type so it can reassemble the byte correctly
        });
    
        // streams are asyn, so we need callback fns for when its open or in error states
        const stream = fs.createReadStream(file, { start, end });
    
        stream.on('open', () => {
          // connect the stream using the pipe fns
          // fns in node that will set the output of a stream to another stream
          stream.pipe(response);
        });
    
        stream.on('error', (streamErr) => {
          response.end(streamErr);
        });
    
        return stream;
      });// end fs.stat
};

const getParty = (request, response) => {
  const file = path.resolve(__dirname, '../client/party.mp4');
    loadMedia(request, response, file);
};// end getParty

const getBling = (request, response) => {
  const file = path.resolve(__dirname, '../client/bling.mp3');
  loadMedia(request, response, file);
};

const getBird = (request, response) => {
    const file = path.resolve(__dirname, '../client/bird.mp4');
    loadMedia(request, response, file);
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
