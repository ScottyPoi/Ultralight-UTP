import { Uint16 } from "@chainsafe/lodestar-types";
import { Multiaddr } from "multiaddr";
import { IUtpSocketKeyOptions } from "../Socket/socketTyping";

export class UtpSocketKey {
    remoteAddress: Multiaddr;
    rcvId: Uint16;
  
    constructor(options: IUtpSocketKeyOptions) {
      this.remoteAddress = options.remoteAddress;
      this.rcvId = options.rcvId;
    }
  }