import { _UTPSocket } from "../Socket/_UTPSocket";
import { ConnectionState, Packet, randUint16 } from "..";

export class UtpProtocol {
  socket: _UTPSocket;
  client: 
  payloadChunks: Uint8Array[];

  constructor(portal) {
  // this.payload = payload;
    this.socket = new _UTPSocket();
    // TODO:  ACTUAL CHUNKING MATH
    this.payloadChunks = [];
  }

  processPayload(payload: Buffer): void {
    let packetSize = 1200;
    for (let i=0; i<payload.length; i+= packetSize) {
      this.payloadChunks.push(payload.subarray(i, i+packetSize))
    }
  }

  
  
  nextChunk(): Uint8Array {
    return this.payloadChunks.pop() as Uint8Array;
  }



  initiateSyn() {
    this.socket.sendSyn();
  }

  async handleAck(ack: Packet): Promise<void> {
    this.socket.state = ConnectionState.Connected;
    this.socket.ackNr = ack.header.seqNr;
    this.payloadChunks.length > 0
    ? this.sendData(this.nextChunk())
    : this.socket.sendFin();
  }
  
  sendData(chunk: Uint8Array): void {
    this.socket.sendData(
      this.socket.seqNr,
      this.socket.ackNr,
      this.socket.sndConnectionId,
      chunk
    );
  }

  handleIncomingSyn(packet: Packet) {
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.rcvConnectionId = packet.header.connectionId + 1;
    this.socket.sndConnectionId = packet.header.connectionId;
    this.socket.seqNr = randUint16();
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.SynRecv;
    this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.sndConnectionId,
      this.socket.ackNr
    );
  }

  handleIncomingData(packet: Packet) {
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.Connected;
    this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.ackNr,
      this.socket.sndConnectionId
    );
  }



}
