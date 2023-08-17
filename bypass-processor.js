// Copyright (c) 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * A simple bypass node demo.
 *
 * @class BypassProcessor
 * @extends AudioWorkletProcessor
 */
class BypassProcessor extends AudioWorkletProcessor {
    // When constructor() undefined, the default constructor will be implicitly
    // used.
    constructor(...args) {
        super(...args);
        const that = this;
        this.port.onmessage = (e) => {
            if (e.data.type === "setAmplitudeArray") {
                that.amplitudeArray = e.data.amplitudeArray;
            }
          };
    }
  
    process(inputs, outputs) {
      // By default, the node has single input and output.
      const input = inputs[0];
    // const input = [new Float32Array(128)]
      const output = outputs[0];

    //   console.log('input');
    //   console.log(input);
    //   console.log(this.amplitudeArray);

        for (let i = 0; i < input[0].length; i++) {
            input[0][i] = this.amplitudeArray[i];
        }
  
      for (let channel = 0; channel < output.length; ++channel) {
        output[channel].set(input[channel]);
      }
  
      return true;
    }
  }
  
  registerProcessor('bypass-processor', BypassProcessor);