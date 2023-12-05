import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Peer } from "peerjs";

@Component({
  selector: "app-video-call",
  templateUrl: "./video-call.component.html",
  styleUrls: ["./video-call.component.css"],
})
export class VideoCallComponent implements OnInit {
  peerId: any;
  peerIdShare: any;
  private peer: Peer = new Peer();
  lazyStream: any;
  currentPeer: any;
  peerList: any[] = [];

  @ViewChild("remoteVideo", { static: true }) remoteVideo!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.getPeerId();
  }

  private getPeerId = () => {
    //Generate unique Peer Id for establishing connection
    this.peer.on("open", (id) => {
      this.peerId = id;
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
}
