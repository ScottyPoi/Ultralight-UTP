import { Multiaddr } from "multiaddr";
import { randUint16 } from "../Utils/math";
import { SocketConfig, UtpSocket } from "../Socket/utpSocket";
import { ConnectionDirection, ConnectionState, SendCallback } from "../Socket/socketTyping";

export function initOutgoingSocket(
    to: Multiaddr,
    cfg: SocketConfig,
    snd: SendCallback = (to, data) => Promise.resolve(),
  ): UtpSocket {
    //   # TODO handle possible clashes and overflows
    let rcvConnectionId = randUint16();
    let sndConnectionId = rcvConnectionId + 1;
    let initialSeqNr = randUint16();
  
    return new UtpSocket({
      remoteaddress: to,
      state: ConnectionState.SynSent,
      socketConfig: cfg,
      direction: ConnectionDirection.Outgoing,
      connectionIdRcv: rcvConnectionId,
      connectionIdSnd: sndConnectionId,
      seqNr: initialSeqNr,
      ackNr: 0,
    });
  }