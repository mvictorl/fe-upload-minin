export function upload(selector, opt = {}) {
  let files = []
  const onUpload = opt.onUpload ?? noop
  const $input = document.querySelector(selector)
  const $preview = addTag('div', ['preview'])
  const $openBtn = addTag('button', ['btn'], 'Открыть...')
  const $uploadBtn = addTag('button', ['btn', 'primary'], 'Загрузить')

  if (opt.multi) {
    $input.setAttribute("multiple", true)
  }
  if (opt.accept && Array.isArray(opt.accept)) {
    $input.setAttribute("accept", opt.accept.join(","))
  }

  $input.style.display = 'none'
  $uploadBtn.style.display = 'none'

  $input.addEventListener("change", changeHandler)  
  $preview.addEventListener('click', removeHandler)
  $openBtn.addEventListener("click", triggerInput)
  $uploadBtn.addEventListener("click", uploadHandler)  

  $input.insertAdjacentElement("afterend", $preview)
  $input.insertAdjacentElement("afterend", $uploadBtn)
  $input.insertAdjacentElement("afterend", $openBtn)

  function triggerInput() {
    $input.click()
  }

  function changeHandler(event) {
    const items = [...event.target.files] // == Array.from(event.target.files)
    if (items.length) {
      $preview.innerHTML = null
      $uploadBtn.style.display = 'inline'
      files.splice(0, files.length)
      // ToDo: checkbox to remove
      files = items.filter((file) => file.type.match("image"))
      files.map((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          // ToDo: long file name handler
          $preview.insertAdjacentHTML(
            "afterbegin",
            `
              <div class="preview-item">
                <div class="preview-remove" data-name="${file.name}">&times;</div>
                <img src="${event.target.result}" alt="${file.name}" />
                <div class="preview-info">
                  <span>${file.name}</span>
                  <span>${humanFileSize(file.size)}</span>
                </div>
              </div>
            `
          )
        }
        reader.readAsDataURL(file)
      })
    }
    return
  }

  function removeHandler(event) {
    if (event.target.dataset.name) {
      const { name } = event.target.dataset
      files = files.filter(file => file.name !== name)
      const block = $preview
              .querySelector(`[data-name="${name}"]`)
              .closest('.preview-item')
      block.classList.add('removing')
      setTimeout(() => block.remove(), 300)
      if (!files.length) { setTimeout(() => $uploadBtn.style.display = 'none', 300) }
    }
    else return
  }

  function clearPreviewInfo(el) {
    el.style.bottom = 0
    el.innerHTML = '<div class="preview-info-progress"></div>'
  }

  function uploadHandler() {
    $preview.querySelectorAll('.preview-remove').forEach(el => el.remove())
    const $previewInfo = $preview.querySelectorAll('.preview-info')
    $previewInfo.forEach(clearPreviewInfo)
    onUpload(files, $previewInfo)
  }
}

function humanFileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return Math.round(size / Math.pow(1024, i)) + " " + ["B", "kB", "MB", "GB", "TB"][i]
}

function addTag(tag = 'div', classes = [], text) {
  const $elem = document.createElement(tag)
  if (classes) { $elem.classList.add(...classes) }  
  if (text) { $elem.textContent = text }
  return $elem
}

function noop() {}