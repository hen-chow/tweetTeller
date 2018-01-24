const teller = require('@autopilot/teller');
const client = teller.impl({})({
  NetworkLayer: {
    // Because we haven't implemented acks in Banks yet. This won't be
    // needed in the near future.
    requestAcknowledgementTimeout: 4000,
  },
});

client.NetworkLayer.open((err, result) => {
  if (err) {
    outputError(err);
    return
  }

  client.Transport.connect((err, result) => {
    if (err) {
      outputError(err);;
      return
    }

    process.on('beforeExit', (code) => {
      client.NetworkLayer.close();
    });

    console.log("CONNECTION ID", result.body.connectionID);

    const options = {
      instanceName: "test",
      resourceName: "Tweets",
      messageName: "GetTweet",
      // body: {},
    };

    client.Transport.requestResponse(options, (err, result) => {
      if (err) {
        outputError(err);
        return
      }

      console.log("\n\nTweets");

      // some business logic for handling the return results
      console.log(result.body);

      // for (const day of result.body.days) {
      //   for (const time of day.times) {
      //     const minHeight = round(time.surf.minHeight, 4);
      //     const maxHeight = round(time.surf.maxHeight, 4);
      //     console.log(`${time.timestamp}: ${minHeight} ... ${maxHeight}`);
      //   }
      // }
    });
  });
});

// output a Teller error in a human-readable format
function outputError(err) {
  if (err.details && err.details.responseHeaderErrors) {
    const errs = err.details.responseHeaderErrors;

    if (errs.length > 1) {
      for (const e of errs) {
        console.log(`\t${e.message} (Error code ${e.code})`);
      }
    } else {
      console.log(`\nError: ${errs[0].message} (Error code ${errs[0].code})`);
    }

  } else {
    console.log("\nError:", err.toString());
  }

  process.exitCode = 1;
}
