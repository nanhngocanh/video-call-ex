import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DataConnection, Peer, PeerJSOption } from "peerjs";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "app-video-call",
  templateUrl: "./video-call.component.html",
  styleUrls: ["./video-call.component.css"],
})
export class VideoCallComponent implements OnInit {
  peerId: any;
  peerIdShare: any;
  private peer!: Peer;
  lazyStream: any;
  currentPeer: any;
  peerList: any[] = [];

  messages: any[] = [];
  message: any = "";
  conn!: DataConnection;

  @ViewChild("remoteVideo", { static: true }) remoteVideo!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.getPeerId();
  }

  private getPeerId = () => {
    //Generate unique Peer Id for establishing connection
    if (!this.peer || this.peer.disconnected) {
      const peerJsOptions: PeerJSOption = {
        debug: 3,
        config: {
          iceServers: [
            {
              urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
          ],
        },
      };
      try {
        let id = uuidv4();
        this.peer = new Peer(id, peerJsOptions);
        this.peerId = id;
      } catch (error) {
        console.error(error);
      }
    }

    this.peer.on("connection", (NAconn: any) => {
      this.conn = NAconn;
      this.conn.on("data", (message) =>
        this.messages.push({
          message: message,
          type: "receive",
        })
      );
    });

    // Peer event to accept incoming calls
    this.peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          this.lazyStream = stream;

          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (!this.peerList.includes(call.peer)) {
              this.streamRemoteVideo(remoteStream);
              this.currentPeer = call.peerConnection;
              this.peerList.push(call.peer);
            }
          });
        })
        .catch((err) => {
          console.log(err + "Unable to get media");
        });
    });
  };

  private streamRemoteVideo(stream: MediaProvider | null) {
    const video = document.createElement("video");
    video.classList.add("video");
    video.style.width = "inherit";
    video.style.height = "inherit";
    video.srcObject = stream;
    video.play();
    this.remoteVideo.nativeElement.appendChild(video);
  }

  private callPeer(id: string): void {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.lazyStream = stream;

        this.conn = this.peer.connect(id);
        this.conn.on("data", (message) =>
          this.messages.push({
            message: message,
            type: "receive",
          })
        );

        const call = this.peer.call(id, stream);
        call.on("stream", (remoteStream) => {
          if (!this.peerList.includes(call.peer)) {
            this.streamRemoteVideo(remoteStream);
            this.currentPeer = call.peerConnection;
            this.peerList.push(call.peer);
          }
        });
      })
      .catch((err) => {
        console.log(err + "Unable to connect");
      });
  }

  connectWithPeer() {
    this.callPeer(this.peerIdShare);
  }

  sendMessage() {
    this.conn.send(this.message);
    this.messages.push({
      message: this.message,
      type: "send",
    });
    this.message = "";
  }
}
