import { _UTPSocket } from "../Socket/_UTPSocket";
import { bufferToPacket, ConnectionState, Packet, randUint16 } from "..";
import {PortalNetwork} from '../../../../../dist';
import { Discv5 } from "@chainsafe/discv5";

export class UtpProtocol {
  socket: _UTPSocket;
  client: Discv5
  payloadChunks: Uint8Array[];

  constructor(client: Discv5) {
  this.client = client;
    this.socket = new _UTPSocket(client);
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
  
  
  
  initiateSyn(dstId: string) {
    this.socket.sendSyn(dstId);
  }
  
  async handleAck(ack: Packet, dstId: string): Promise<void> {
    this.socket.state = ConnectionState.Connected;
    this.socket.ackNr = ack.header.seqNr;
    this.payloadChunks.length > 0
    ? this.sendData(this.nextChunk(), dstId)
    : this.socket.sendFin(dstId);
  }
  
  sendData(chunk: Uint8Array, dstId: string): void {
    this.socket.sendData(
      this.socket.seqNr,
      this.socket.ackNr,
      this.socket.sndConnectionId,
      chunk,
      dstId
      );
    }
    
    handleIncomingSyn(packetAsBuffer: Buffer, srcId: string): void {
      const packet: Packet = bufferToPacket(packetAsBuffer)
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.rcvConnectionId = packet.header.connectionId + 1;
    this.socket.sndConnectionId = packet.header.connectionId;
    this.socket.seqNr = randUint16();
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.SynRecv;
    this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.sndConnectionId,
      this.socket.ackNr,
      srcId
    );
  }

  handleIncomingData(packet: Packet, dstId: string) {
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.Connected;
    this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.ackNr,
      this.socket.sndConnectionId,
      dstId
    );
  }



}
