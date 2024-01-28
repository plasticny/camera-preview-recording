<template>
  <div id="v_recording" :style="{ background: is_native ? 'unset' : 'black' }">
    <div id="timer">{{ timer ? timer_to_min_sec(timer) : '' }}</div>
    <div id="controller"
      :class="{ recording: is_recording }"
      @click="is_recording ? stop_recording() : start_recording()">
      <div id="controller_inner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview'
import { File, FileError } from '@awesome-cordova-plugins/file'
import { Capacitor } from '@capacitor/core'

// === reactive === //
const is_recording = ref(false)
const timer : Ref<number | undefined> = ref(0)

// === attribute === //
const is_native = Capacitor.isNativePlatform()

// === variable === //
let timer_interval_id : number | undefined

// === lifecycle === //
onMounted(async function () {
  // start the preview camera
  if (!is_native) { return }

  await CameraPreview.startCamera({
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: CameraPreview.CAMERA_DIRECTION.BACK,
    toBack: true,
    tapPhoto: false,
    tapFocus: true,
    previewDrag: false,
    storeToFile: false,
    disableExifHeaderStripping: false
  }).then((d) => {
    console.log(d)
  })

  const front_width = window.screen.width / 4
  const front_height = window.screen.height / 4
  await CameraPreview.startCamera({
    x: window.screen.width - front_width - 30,
    y: 10,
    width: front_width,
    height: front_height,
    camera: CameraPreview.CAMERA_DIRECTION.FRONT,
    toBack: true,
    tapPhoto: false,
    tapFocus: true,
    previewDrag: false,
    storeToFile: false,
    disableExifHeaderStripping: false
  })
})

// === recording function === //
async function start_recording () {
  if (!is_native) {
    is_recording.value = true
    start_timer()
    return
  }

  // start recording
  await CameraPreview.startRecordVideo({
    cameraDirection: CameraPreview.CAMERA_DIRECTION.BACK,
    width: window.screen.width,
    height: window.screen.height,
    quality: 60,
    withFlash: true
  })

  await CameraPreview.startRecordVideo({
    cameraDirection: CameraPreview.CAMERA_DIRECTION.FRONT,
    width: window.screen.width,
    height: window.screen.height,
    quality: 60,
    withFlash: true
  })

  is_recording.value = true
  start_timer()
}
async function stop_recording () {
  if (!is_native) {
    is_recording.value = false
    stop_timer()
    return
  }

  // stop recording
  const front_full_path = await CameraPreview.stopRecordVideo({
    cameraDirection: CameraPreview.CAMERA_DIRECTION.FRONT
  })
  const back_full_path = await CameraPreview.stopRecordVideo({
    cameraDirection: CameraPreview.CAMERA_DIRECTION.BACK
  })
  is_recording.value = false
  stop_timer()

  // ensure target dir is exist
  const target_dir_location = 'file:///storage/emulated/0/DCIM/'
  const target_dir_name = 'Recordings'
  try {
    await File.createDir(target_dir_location, target_dir_name, false)
  } catch (err) {
    // code 12 means dir is exist, which is actually not an error
    if ((err as FileError).code !== 12) {
      // report if other error
      console.error('createDir error: ', err)
    }
  }

  // more video to external data storage
  const front_file_name = front_full_path.substring(front_full_path.lastIndexOf('/') + 1, front_full_path.length)
  const back_file_name = back_full_path.substring(back_full_path.lastIndexOf('/') + 1, back_full_path.length)
  await File.moveFile(
    File.cacheDirectory, front_file_name,
    // File.externalDataDirectory, `video_${new Date().getTime()}.mp4`
    `${target_dir_location}${target_dir_name}/`, `front_video_${new Date().getTime()}.mp4`
  )
  await File.moveFile(
    File.cacheDirectory, back_file_name,
    // File.externalDataDirectory, `video_${new Date().getTime()}.mp4`
    `${target_dir_location}${target_dir_name}/`, `back_video_${new Date().getTime()}.mp4`
  )
}
// === recording function === //

// === timer function === //
function start_timer () {
  timer.value = 0
  timer_interval_id = setInterval(() => {
    if (timer.value === undefined) { return }
    timer.value++
  }, 1000)
}
function stop_timer () {
  if (timer_interval_id) {
    clearInterval(timer_interval_id)
  }
}
function timer_to_min_sec (timer: number) : string {
  const min = Math.floor(timer / 60)
  const sec = timer % 60
  return `${min}:${sec < 10 ? '0' + sec : sec}`
}
// === timer function === //
</script>

<style>
@import url('../assets/css/RecordingView.css');
</style>
