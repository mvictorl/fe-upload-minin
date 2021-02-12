import firebase from 'firebase/app'
import 'firebase/storage'
import { upload } from './upload.js'

const firebaseConfig = {
  apiKey: "AIzaSyCiHSdqbIbu6N0hmeHg6tCMzk3INjlJ6e8",
  authDomain: "fe-upload-files.firebaseapp.com",
  projectId: "fe-upload-files",
  storageBucket: "fe-upload-files.appspot.com",
  messagingSenderId: "338005466252",
  appId: "1:338005466252:web:46a8ad43f60a927adbafa9"
}
firebase.initializeApp(firebaseConfig)

const storage = firebase.storage()

upload('#file', {
  multi: true,
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  onUpload(files, blocks) {
    files.forEach((file, index) => {
      const ref = storage.ref(`images/${file.name}`)
      const task = ref.put(file)

      task.on('state_changed', snapshot => {
        const percent = (((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)) + '%'
        // console.log('Upload is ' + percent + '% done');
        const block = blocks[index].querySelector('.preview-info-progress')
        block.textContent = percent
        block.style.width = percent
      }, error => {
        console.error(error)
      }, () => {
        task.snapshot.ref.getDownloadURL().then(url => {
          console.log(`File "${task.snapshot.ref.name}" available by ✨ ${url}`);
        })
      })
    })
  }
})