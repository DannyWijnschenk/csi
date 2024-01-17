<template>
  <teleport to="body">
    <transition name="fade">
      <div class="pt-5 position-fixed top-0 start-0 h-100 w-100" style="background-color: rgba(0, 0, 0, 0.25)">
        <div id="backdrop" @click="closeBackdrop" class="modal1-dialog h-100 overflow-auto">
          <div class="container card mt-5 ms-5 ps-5" style="max-width:100">
            <div class="card-header" >
              <h5>
                {{title}}
                <button @click="$emit('cancel')" class="btn btn-text float-end"><strong>X</strong></button>
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-2">
                <div class="col-md-12">{{question}}</div>
              </div>
              <div class="row mb-2">
                <div class="col-md-2">
                  <input type="button" class="btn btn-outline-primary" v-on:click="$emit('confirm')" value="Yes" />&nbsp;&nbsp;&nbsp;
                  <input type="button" class="btn btn-outline-secondary" v-on:click="$emit('cancel')" value="No" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: ["title","question"],
  emits: ["confirm", "cancel"],
});
</script>

<style>
.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #cececeb5;
}
.modal-body {
  background-color: #fff;
  border: 2px solid #74a2cf;
  border-radius: 10px;
  text-align: center;
  padding: 20px 40px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
}
.modal-action {
  display: flex;
  flex-direction: row;
  gap: 40px;
  justify-content: center;
}
.modal-button {
  cursor: pointer;
  height: 30px;
  padding: 0 25px;
  border: 2px solid #74a2cf;
  border-radius: 5px;
  background-color: #80b2e4;
  color: #fff;
}
.modal-close {
  cursor: pointer;
  position: relative;
  align-self: end;
  right: -33px;
  top: -17px;
}
</style>

