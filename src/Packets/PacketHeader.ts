import { Uint16, Uint32, Uint8 } from "@chainsafe/lodestar-types";
import internal, { Stream} from "stream";
import { VERSION } from "../Utils/constants";
import { DEFAULT_WINDOW_SIZE, IPacketHeader, MicroSeconds, PacketType } from "./PacketTyping";



export class PacketHeader {
    pType: PacketType;
    version: Uint8;
    extension: Uint8;
    connectionId: Uint16;
    timestamp: MicroSeconds;
    timestampDiff: MicroSeconds;
    wndSize?: Uint32;
    seqNr: Uint16;
    ackNr: Uint16;
  
    constructor(options: IPacketHeader) {
        this.pType = options.pType;
        this.version = options.version || VERSION;
        this.extension = 0
        this.connectionId = options.connectionId
        this.timestamp = performance.now()
        this.timestampDiff = options.timestampDiff || 0
        this.wndSize = options.wndSize || DEFAULT_WINDOW_SIZE
        this.seqNr = options.seqNr
        this.ackNr = options.ackNr;
    } 
    OutputStream: internal.Duplex = new Stream.Duplex()
encodeTypeVer(): Uint8 {
    let typeVer: Uint8 = 0;
    let typeOrd: Uint8 = this.pType;
    typeVer = (typeVer & 0xf0) | (this.version & 0xf);
    typeVer = (typeVer & 0xf) | (typeOrd << 4);
    return typeVer;
  }
encodeHeaderStream() {
    try {
        this.OutputStream.write(this.encodeTypeVer);
        this.OutputStream.write(this.extension);
        this.OutputStream.write(this.connectionId);
        this.OutputStream.write(this.timestamp);
        this.OutputStream.write(this.timestampDiff);
        this.OutputStream.write(this.wndSize);
        this.OutputStream.write(this.seqNr);
        this.OutputStream.write(this.ackNr);
      } catch (error) {
        console.error(error);
      }
    }

}
