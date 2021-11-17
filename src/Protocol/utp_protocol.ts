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
    this.payloadChunks = [];
  }


  // TODO: Chop up CONTENT into chunks.
  // TODO: Reassemble chunks

  processContent(payload: Buffer): void {
    let packetSize = 1200;
    for (let i=0; i<payload.length; i+= packetSize) {
      this.payloadChunks.push(payload.subarray(i, i+packetSize))
    }
  }

  
  
  
  nextChunk(): Uint8Array {
    return this.payloadChunks.pop() as Uint8Array;
  }
  
  
  
  async initiateSyn(dstId: string): Promise<void> {
    await this.socket.sendSyn(dstId);
  }
  
  async handleAck(ack: Packet, dstId: string): Promise<void> {
    this.socket.state = ConnectionState.Connected;
    this.socket.ackNr = ack.header.seqNr;
    this.payloadChunks.length > 0
    ? await this.sendData(this.nextChunk(), dstId)
    : await this.socket.sendFin(dstId);
  }
  
  async sendData(chunk: Uint8Array, dstId: string): Promise<void> {
    await this.socket.sendData(
      this.socket.seqNr,
      this.socket.ackNr,
      this.socket.sndConnectionId,
      chunk,
      dstId
      );
    }
    
    async handleIncomingSyn(packetAsBuffer: Buffer, srcId: string): Promise<void> {
      const packet: Packet = bufferToPacket(packetAsBuffer)
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.rcvConnectionId = packet.header.connectionId + 1;
    this.socket.sndConnectionId = packet.header.connectionId;
    this.socket.seqNr = randUint16();
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.SynRecv;
    await this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.sndConnectionId,
      this.socket.ackNr,
      srcId
    );
  }

  async handleIncomingData(packet: Packet, dstId: string): Promise<void> {
    this.socket.updateRTT(packet.header.timestampDiff);
    this.socket.ackNr = packet.header.seqNr;
    this.socket.state = ConnectionState.Connected;
    await this.socket.sendAck(
      this.socket.seqNr++,
      this.socket.ackNr,
      this.socket.sndConnectionId,
      dstId
    );
  }



}
