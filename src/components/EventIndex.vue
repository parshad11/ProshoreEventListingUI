<template>
  <section class="innerpage-wrap">
    <div class="container">
      <b-modal hide-header="1" id="response_model">
    <p class="my-4">{{responsemessage}}</p>
  </b-modal>
      <div class="overflow-auto">
        <div class="banner">
          <div>
            <p class="mt-3">Current Page: {{ currentPage }}</p>
          </div>
          <div>
            <button type="button" @click="addEventDataManage" class="btn btn-outline-dark">Click to add Event List</button>
          </div>
          <div>
            <b-dropdown text="Filter Event List">
              <b-dropdown-item @click="catagoryEventFilter('all_events')">All</b-dropdown-item>
              <b-dropdown-item @click="catagoryEventFilter('Finished Event')">Finished Events</b-dropdown-item>
              <b-dropdown-item @click="catagoryEventFilter('Upcomming Event')">Upcomming Events</b-dropdown-item>
              <b-dropdown-item @click="catagoryEventFilter('Ongoing Event')">Ongoing Events</b-dropdown-item>
              <b-dropdown-item @click="catagoryEventFilter('WithIn 7 days')">Within 7 days Events</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        
        <b-table id="my-table" :items="data_collector" :fields="fields" :per-page="perPage" :current-page="currentPage" small>
          <template #cell(actions)="data">
      <button class="btn btn-dark btn-sm" @click="editEventsDataManage(data.item)" :ref="'btn' + data.index">Edit</button>
      <button class="btn btn-danger btn-sm" @click="deleteEvents(data.item.id)" :ref="'btn' + data.index">Delete</button>
    </template>
        </b-table>
        <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table">
        </b-pagination>
      </div>
      <b-modal id="modal_edit" hide-footer="1"  hide-header="1" size="lg" ok-only no-stacking>
        <div>
  <b-card bg-variant="light">
    <b-form-group
      label-cols-lg="3"
      label="Event List"
      label-size="lg"
      label-class="font-weight-bold pt-0"
      class="mb-0"
    >
      <b-form-group
        label="Title:"
        label-for="title"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input v-model="event_collentor.title" id="title"></b-form-input>
        <span class="error" v-if="form_errors.title_error">{{form_errors.title_error}}</span>
      </b-form-group>

      <b-form-group
        label="Description:"
        label-for="description"
        label-cols-sm="3"
        label-align-sm="right"
      >
        <b-form-input v-model="event_collentor.description" id="description"></b-form-input>
        <span class="error" v-if="form_errors.description_error">{{form_errors.description_error}}</span>
      </b-form-group>

      <div style="width: 92%; margin-left: 8%;">
    <label for="example-input">Choose Start Date</label>
    <b-input-group class="mb-3">
      <b-form-input
        id="start_date"
        v-model="event_collentor.start_date"
        type="text"
        placeholder="YYYY-MM-DD"
        autocomplete="off"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          v-model="event_collentor.start_date"
          :min="start_min"
          button-only
          right
          locale="en-US"
          aria-controls="start_date"
          @context="onContext"
        ></b-form-datepicker>
      </b-input-group-append>
      <span class="error" v-if="form_errors.start_date_error">{{form_errors.start_date_error}}</span>
    </b-input-group>

    <label for="example-input">Choose End Date</label>
    <b-input-group class="mb-3">
      <b-form-input
        id="end_date"
        v-model="event_collentor.end_date"
        type="text"
        placeholder="YYYY-MM-DD"
        autocomplete="off"
        width="70px"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          v-model="event_collentor.end_date"
          button-only
          :min="end_min"
          right
          mindate="today"
          locale="en-US"
          aria-controls="end_date"
          @context="onContext"
        ></b-form-datepicker>
      </b-input-group-append>
      <span class="error" v-if="form_errors.end_date_error">{{form_errors.end_date_error}}</span>
    </b-input-group>
  </div>
    </b-form-group>
  </b-card>
</div>
<b-container fluid>
  <div class="action-btn text-center mt-4">
    <b-button class="button-brand mx-1" @click="handle_function_call(function_setting)">Submit</b-button>
            </div>
          </b-container>
  </b-modal>
    </div>
  </section>
</template>

<script>

import axios from 'axios'
export default ({

  name: 'EventIndex',
  data: function () {
    return {
      perPage: 10,
      fields: ['title', 'description', 'start_date', 'end_date', {label:'Event status',key:'status'},{key: "actions"}],
      currentPage: 1,
      all_data: [],
      form_errors:{
        title_error:'',
        description_error:'',
        start_date_error:'',
        end_date_error:'',
      },
      data_collector: [],
      finished_event: [],
      upcomming_event: [],
      within_week_event: [],
      on_going_event: [],
      event_collentor:{
        id:'',
        title:'',
        description:'',
        start_date:'',
        end_date:'',
      },
      responsemessage: '',
      response_model: false,
      value:'',
      function_setting:'',
      end_min:new Date(new Date().setDate(new Date().getDate() + 2)).toJSON().slice(0, 10),
      start_min:new Date(new Date()).toJSON().slice(0, 10),
      error:0,
    }
  },
  mounted() {
    let app = this;
    app.getList();
  },
  methods: {
    getList() {
      let app = this;
      axios.get('/get-event-list').then((response) => {
        app.all_data = app.refineDataList(response.data.data.data);
        app.data_collector = app.all_data;
        app.currentPage = response.data.data.current_page;

      })
    },
    refineDataList: function (data) {
      let app = this;
      let current_date = new Date().toJSON().slice(0, 10);
      let tommorow = new Date(new Date().setDate(new Date().getDate() + 1)).toJSON().slice(0, 10);
      let week = new Date(new Date().setDate(new Date().getDate() + 7)).toJSON().slice(0, 10);
      data.forEach(element => {
        if ('element.start_date < current_date', element.start_date < current_date && 'element.end_date > current_date', element.end_date > current_date) {
          app.$set(element, 'status', 'Ongoing Event');
          app.on_going_event.push(element);
        }
        if ('element.start_date < current_date', element.start_date < current_date && 'element.end_date < current_date', element.end_date < current_date) {
          app.$set(element, 'status', 'Finished Event');
          app.finished_event.push(element);
        }
        if ('element.start_date >= tommorow', element.start_date >= tommorow) {
          if ('element.end_date <= week', element.end_date <= week) {
            app.$set(element, 'status', 'WithIn 7 days');
            app.within_week_event.push(element);
          }
          else {
            app.$set(element, 'status', 'Upcomming Event');
            app.upcomming_event.push(element);
          }
        }
      });
      return data;
    },

    catagoryEventFilter:function(catagory){
      let app = this;
      if(catagory == 'all_events'){
        app.data_collector = app.all_data;
      }
      else{
        app.data_collector = app.all_data.filter(function (data) {
        if(data.status == catagory){
          return data;
        }
      })
      }
    },
    
    deleteEvents: function(id){
      let app = this;
      axios.delete('/delete-event-list',{
        params: {
          id: id,
        }
      })
      .then(function (response) {
            if (response.data.status == 'success') {
              app.showAlert('Event has been deleted successfully');
              app.getList();
            }
          })
          .catch(function (error) {
            console.log(error);
          });
    },

    addEventDataManage: function(){
      let app = this;
      app.form_errors =[];
      app.error = 0;
      app.function_setting ='addEvent';
      app.$root.$emit('bv::show::modal', 'modal_edit', '#btnShow');
    },
    validate:function(validating_data){
      let app = this;
      app.form_errors =[];
      app.error = 0;
      if(validating_data.title == ''){
        app.form_errors.title_error = 'Title is a required field';
        app.error = 1;
      }
      if(validating_data.description == ''){
        app.form_errors.description_error = 'Description is a required field';
        app.error = 1;
      }
      if(validating_data.start_date == ''){
        app.form_errors.start_date_error = 'Start date is a required field';
        app.error = 1;
      }
      if(validating_data.end_date == ''){
        app.form_errors.end_date_error = 'End date is a required field';
        app.error = 1;
      }
      if(validating_data.start_date < new Date(new Date()).toJSON().slice(0, 10)){
        app.form_errors.start_date_error = 'Start date cannot be less than '+new Date(new Date()).toJSON().slice(0, 10);
        app.error = 1;
      }
      if(validating_data.end_date < new Date(new Date().setDate(new Date().getDate() + 2)).toJSON().slice(0, 10)){
        app.form_errors.end_date_error = 'End date cannot be less than '+new Date(new Date().setDate(new Date().getDate() + 2)).toJSON().slice(0, 10);
        app.error = 1;
      }
    },

    addEvent:function (){
      let app = this;
      app.validate(app.event_collentor);
      if(app.error == 0){
        axios.post('/add-event-list',{
          title:app.event_collentor.title,
          description:app.event_collentor.description,
          start_date:app.event_collentor.start_date,
          end_date:app.event_collentor.end_date
      })
      .then(function (response) {
            if (response.data.status == 'success') {
              app.$root.$emit('bv::hide::modal', 'modal_edit', '#btnShow');
              app.showAlert('Event has been Added successfully');
              app.getList();
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },

    editEventsDataManage: function(editing_data){
      let app = this;
      app.event_collentor.id = editing_data.id;
      app.event_collentor.title = editing_data.title;
      app.event_collentor.description = editing_data.description;
      app.event_collentor.start_date = editing_data.start_date;
      app.event_collentor.end_date = editing_data.end_date;
      app.function_setting ='editEvent';
      app.$root.$emit('bv::show::modal', 'modal_edit', '#btnShow');
    },

    handle_function_call(function_name) {
      this[function_name]()
},

    editEvent: function(){
      let app = this;
      app.validate(app.event_collentor);
      if(app.error == 0){
      axios.post('/edit-event-list',{
          id: app.event_collentor.id,
          title:app.event_collentor.title,
          description:app.event_collentor.description,
          start_date:app.event_collentor.start_date,
          end_date:app.event_collentor.end_date
      })
      .then(function (response) {
            if (response.data.status == 'success') {
              app.$root.$emit('bv::hide::modal', 'modal_edit', '#btnShow');
              app.showAlert('Event has been Edited successfully');
              app.getList();
            }
          })
          .catch(function (error) {
            console.log(error);
          });
        }
    },

    showAlert(resmessage) {
      let app = this;
      app.$root.$emit('bv::show::modal', 'response_model', '#btnShow')
      app.responsemessage = resmessage;
      

      },
      onContext(ctx) {
        this.formatted = ctx.selectedFormatted
        this.selected = ctx.selectedYMD
      }
  },
  computed: {
    rows() {
      return this.data_collector.length
    }
  }
})
</script>

<style>
#my-table button{
  margin: 3px;
}

.banner{
  display: flex;
  justify-content: space-around;
}

.error{
  color: red;
}
</style>
