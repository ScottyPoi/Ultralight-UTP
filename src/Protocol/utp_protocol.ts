import { _UTPSocket } from "../Socket/_UTPSocket";
import { ConnectionState, Packet, randUint16 } from "..";

export class UtpProtocol {
  socket: _UTPSocket;

  // transport: PortalNetwork;
  payload: Buffer;
  payloadChunks: Uint8Array[];

  // constructor(payload: Buffer, transport: PortalNetwork) {
  constructor(payload: Buffer) {
  this.payload = payload;
    this.socket = new _UTPSocket();
    // this.transport = transport
    // TODO:  ACTUAL CHUNKING MATH
    this.payloadChunks = [Uint8Array.from(payload.subarray(0))];
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
