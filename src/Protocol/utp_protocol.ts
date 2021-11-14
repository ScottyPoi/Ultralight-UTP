
import UtpServer from "../Server/utpServer";
import { Multiaddr } from "multiaddr";
import { SendCallback } from "../Socket/socketTyping";
import { defaultSocketConfig, UtpSocket } from "../Socket/utpSocket";

export interface IUtpProtocolOptions {
  transport: UtpSocket;
  utpServer: UtpServer;
}

export class UtpProtocol {
  transport: UtpSocket;
  utpServer: UtpServer;
  constructor(options: IUtpProtocolOptions) {
    this.transport = options.transport;
    this.utpServer = options.utpServer;
  }

  async processDatagram(
    raddr: Multiaddr
  ): Promise<void> {
      let buf = this.transport.buffer
      this.utpServer.processIncomingBytes(buf, raddr);
  }

  async shutdownWait(): Promise<void> {
    await this.utpServer.shutdownWait();
    await this.transport.closeWait()
  }

  async connectTo(address: Multiaddr) {
      return this.utpServer.connectTo(address);
  }

  openSockets(): number {
      return this.utpServer.len()
  }

  initSendCallback(transport: UtpSocket): SendCallback {
    let cb: SendCallback = (to: Multiaddr, data: Uint8Array) =>
      transport.send(data, to.nodeAddress().port, to.nodeAddress().address)
    return cb
}

}
