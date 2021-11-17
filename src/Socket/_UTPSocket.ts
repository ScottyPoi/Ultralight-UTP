import dgram from "dgram";
import {
  createAckPacket,
  createDataPacket,
  createFinPacket,
  createResetPacket,
  createSynPacket,
  Packet,
  PacketType,
  randUint16,
} from "..";
import { ConnectionState } from ".";
import { assert } from "console";
import EventEmitter from "events";

const MAX_WINDOW = 1280;

const PacketSent = new EventTarget();
PacketSent.addEventListener("Packet Sent", (id) => {
  console.log("packet sent to" + id);
});

export class _UTPSocket extends EventEmitter {
  seqNr: number;
  ackNr: number;
  sndConnectionId: number;
  rcvConnectionId: number;
  max_window: number;
  cur_window: number;
  reply_micro: number;
  state: ConnectionState;
  rtt: number;
  rtt_var: number
  constructor() {
      super()
    this.seqNr = 1;
    this.ackNr = 0;
    this.rcvConnectionId = randUint16();
    this.sndConnectionId = this.rcvConnectionId + 1;

    this.max_window = MAX_WINDOW;
    this.cur_window = 0;
    this.reply_micro = 0;
    this.state = ConnectionState.SynSent
    this.rtt = 0;
    this.rtt_var = 0;
  }
  
  validatePacketSize(packet: Packet): boolean {
    return packet.payload.length <= this.max_window;
  }
  sendPacket(packet: Packet, type: PacketType): void {
    // let msg = packet.encodePacket();
    // if (this.validatePacketSize(packet)) {
    //    this.send(msg)
    // }
  }

  sendAck(seqNr: number, sndConnectionId: number, ackNr: number): void {
    const packet = createAckPacket(
      seqNr,
      sndConnectionId,
      ackNr,
      this.rtt_var
    );
    console.log(`Sending ack packet ${packet}`);
    this.sendPacket(packet, PacketType.ST_STATE);
  }

  sendSyn(): void {
    assert(this.state === ConnectionState.SynSent)
    let packet = createSynPacket(this.rcvConnectionId, this.seqNr++, this.ackNr);
    this.seqNr++
    console.log(`Sending syn packet ${packet}`);
    this.sendPacket(packet, PacketType.ST_SYN);
  }

  sendFin() {
    let packet = createFinPacket(
      this.sndConnectionId,
      this.ackNr,
    );
    console.log(`Sending FIN packet ${packet}`);
    this.sendPacket(packet, PacketType.ST_FIN);
    this.seqNr = Number("eof_pkt")
  }

  sendReset() {
    let packet = createResetPacket(
      this.seqNr,
      this.sndConnectionId,
      this.ackNr
    );
    console.log(`Sending RESET packet ${packet}`);
    this.sendPacket(packet, PacketType.ST_RESET);
  }

  sendData(seqNr: number, ackNr: number, sndConnectionId: number, payload: Uint8Array): void {
    
    let packet = createDataPacket(
      seqNr,
      sndConnectionId,
      ackNr,
      this.max_window,
      payload,
      this.rtt_var
    );
    console.log(`Sending DATA packet ${packet}`);
    this.sendPacket(packet, PacketType.ST_DATA);
  }

  updateRTT(packetRTT: number) {
    this.rtt_var += Math.abs((this.rtt - packetRTT) - this.rtt_var) / 4;
    
    this.rtt += (packetRTT - this.rtt) / 8;
  }


}

