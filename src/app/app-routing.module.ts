import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VideoCallComponent } from "./video-call/video-call.component";

const routes: Routes = [
  {
    component: VideoCallComponent,
    path: "",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
