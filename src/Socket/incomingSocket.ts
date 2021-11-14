import { Uint16 } from "@chainsafe/lodestar-types";
import { Multiaddr } from "multiaddr";
import { randUint16 } from "../Utils/math";
import { SocketConfig, UtpSocket } from "../Socket/utpSocket";
import { ConnectionDirection, ConnectionState, SendCallback} from "../Socket/socketTyping";

export function initIncomingSocket(
    to: Multiaddr,
    cfg: SocketConfig,
    connectionId: Uint16,
    ackNr: Uint16
  ): UtpSocket {
    let initialSeqNr = randUint16();
    return new UtpSocket({
      remoteaddress: to,
      state: ConnectionState.SynRecv,
      socketConfig: cfg,
      direction: ConnectionDirection.Ingoing,
      connectionIdRcv: connectionId,
      connectionIdSnd: connectionId,
      seqNr: initialSeqNr,
      ackNr: ackNr,
    });
  }