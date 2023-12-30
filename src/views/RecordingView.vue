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
onMounted(() => {
  // start the preview camera
  if (!is_native) { return }

  CameraPreview.startCamera({
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
  })
})

// === function === //
async function start_recording () {
  if (!is_native) {
    is_recording.value = true
    start_timer()
    return
  }

  // start recording
  CameraPreview.startRecordVideo({
    cameraDirection: CameraPreview.CAMERA_DIRECTION.BACK,
    width: window.screen.width,
    height: window.screen.height,
    quality: 60,
    withFlash: true
  }).then(() => {
    is_recording.value = true
    start_timer()
  })
}

async function stop_recording () {
  if (!is_native) {
    is_recording.value = false
    stop_timer()
    return
  }

  // stop recording
  let full_path = ''
  CameraPreview.stopRecordVideo().then((result) => {
    full_path = result
    is_recording.value = false
    stop_timer()
  })

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
  const file_name = full_path.substring(full_path.lastIndexOf('/') + 1, full_path.length)
  await File.moveFile(
    File.cacheDirectory, file_name,
    // File.externalDataDirectory, `video_${new Date().getTime()}.mp4`
    `${target_dir_location}${target_dir_name}/`, `video_${new Date().getTime()}.mp4`
  )
}

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

function timer_to_min_sec (timer: number) {
  const min = Math.floor(timer / 60)
  const sec = timer % 60
  return `${min}:${sec < 10 ? '0' + sec : sec}`
}
</script>

<style>
@import url('../assets/css/RecordingView.css');
</style>
