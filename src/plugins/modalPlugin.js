import { createVNode, render } from 'vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import AlertModal from '../components/AlertModal.vue'

function mount(component, props, listeners) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const vnode = createVNode(component, {
    ...props,
    ...Object.fromEntries(
      Object.entries(listeners).map(([key, fn]) => [
        `on${key.charAt(0).toUpperCase()}${key.slice(1)}`,
        fn
      ])
    ),
  })

  render(vnode, container)

  return () => {
    render(null, container)
    container.remove()
  }
}

export default {
  install(app) {
    app.config.globalProperties.$confirm = (opts = {}) =>
      new Promise((resolve) => {
        const {
          title = 'Підтвердіть дію',
          body = 'Ви впевнені?',
          confirmText = 'Так',
          cancelText = 'Ні',
        } = opts

        const unmount = mount(
          ConfirmModal,
          { title, body, confirmText, cancelText },
          {
            confirm: () => {
              unmount()
              resolve(true)
            },
            cancel: () => {
              unmount()
              resolve(false)
            },
          }
        )
      })

    app.config.globalProperties.$alert = (opts = {}) =>
      new Promise((resolve) => {
        const {
          title = 'Повідомлення',
          body = 'Ок',
          okText = 'Закрити',
        } = opts

        const unmount = mount(
          AlertModal,
          { title, body, okText },
          {
            close: () => {
              unmount()
              resolve()
            },
          }
        )
      })
  },
}
