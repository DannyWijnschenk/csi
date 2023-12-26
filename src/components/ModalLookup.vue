<template>
    <div>
      <teleport to="body">
        <transition name="fade">
          <div class="pt-5 position-fixed top-0 start-0 h-100 w-100" style="background-color: rgba(0, 0, 0, 0.25)">
            <div id="backdrop" @click="closeBackdrop" class="modal1-dialog h-100 overflow-auto">
              <div class="container card mt-5 ms-5 ps-5" style="max-width:100">
                <div class="card-header" >
                  <h5>
                    {{title}}
                    <button @click='close' class="btn btn-text float-end"><strong>X</strong></button>
                  </h5>
                </div>
                <div class="card-body">
                  <slot></slot>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </teleport>
    </div>
    </template>
    
    <script>
    ///https://medium.com/js-dojo/how-to-build-a-reusable-vuejs-modal-component-fc8d7f3b4735
    ///https://github.com/florianbgt/vue3-bootstrap5-modal/blob/main/src/components/Modal.vue
    ///https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component
      export default {
        name: 'ModalLookup',
        props: ["title"],
        emits: ["closemodallookup"],
        data() {
            return {
            }
        },
        methods: {
          close() {
            console.log('modallookup:close')
            this.$emit('closemodallookup');
          },
          closeBackdrop() {
            console.log('modallookup:closeBackdrop')
          }
        },
      };
    </script>
    <style scoped>
    .fade-enter-active, .fade-leave-active {
      transition: opacity 0.5s
    }
    .fade-enter-from, .fade-leave-to{
      opacity: 0
    }
    </style>