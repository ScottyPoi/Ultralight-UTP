import dgram from "dgram";

const MAX_PACKET_SIZE = 1280;



export class _UTPSocket extends dgram.Socket {
  constructor(options?: any) {
      options && super(options)
  }
  // _createUTPSocket(): _UTPSocket {
  //     return dgram.createSocket('udp4') as _UTPSocket
  // }
}

Object.setPrototypeOf(_UTPSocket, () =>
  dgram.createSocket({
    recvBufferSize: 16 * MAX_PACKET_SIZE,
    sendBufferSize: MAX_PACKET_SIZE,
    type: "udp4",
  })
);
