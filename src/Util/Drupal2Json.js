/* eslint no-console: 0 */
/* eslint no-useless-constructor: 0 */

import moment from 'moment';
import Config from '../Config';

/*
moment.relativeTimeThreshold('d', 30*12);
moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ",
        s:  "s",
        m:  "m",
        mm: "%d m",
        h:  "h",
        hh: "%d h",
        d:  "d",
        dd: "%d d",
        M:  "a mth",
        MM: "%d mths",
        y:  "y",
        yy: "%d y"
    }
});
 */

class Drupal2Json {

 constructor (json) {
  this.json = json;
 }

 getConfig(prop) {
  if (prop) return Config[prop];
  return Config;
 }

 getItem() {
  return this.json;
 }

 count(field, prop) {
  if (typeof this.json[field] === 'undefined') return -1;
  if (typeof this.json[field] === 'number' || typeof this.json[field] === 'string') return 0; // this isn't a array and can't be looped
  if (typeof this.json[field] === 'boolean') return 0;
  return this.json[field].length;
 }

 get (field, prop, delta) {
  if (typeof this.json[field] === 'undefined') return null;
  if (typeof this.json[field] === 'number' || typeof this.json[field] === 'string') return this.json[field]; // (ex. node.title)
  if (!prop) prop = 'value';
  if (delta) {
   if (typeof this.json[field][delta] === 'undefined' || typeof this.json[field][delta][prop] === 'undefined') return null;
   return this.json[field][delta][prop];
  }

  for(var i in this.json[field]) {
   if (typeof this.json[field][i][prop] !== 'undefined') {
    return this.json[field][i][prop];
   }
  }
  return null;
 }

 getLabel() {
  if (this.json.field_name && this.json.field_name.length > 0) return this.json.field_name[0]['value'];
  if (this.json.label) return this.json.label[0]['value'];
  return this.json.title;
 }

 timeAgo(field) {
  var time = this.get(field, 'value');
  if (time) {
   if (parseInt(time, 0) >= 1354562010 && parseInt(time, 0) < 1300000000000) time = time * 1000;
   return moment(time).fromNow();
  }
  return 'recently';
 }

 getTime(field, format) {
  var time = this.get(field, 'value');
  if (time) {
   if (time === '1970-01-01T00:00:00+00:00') return 'never';
   if (parseInt(time, 0) >= 1354562010 && parseInt(time, 0) < 1300000000000) time = time * 1000;
   if (!format) format = 'MMMM Do YYYY, h:mm:ss a';
   return moment(time).format(format);
  }
  return null;
 }

 findPropVal(field, value, prop) {
  for(var i in this.json[field]){
   var val = this.json[field][i][prop];
   if (value === val) {
    return value;
   }
  }
  return false;
 }

 getImgPath(tests) { // also handles names
  // if (!tests) tests = {'field_headshot':'url', 'user_picture':'url', 'field_fb_id':'value'};  'uid':'url',
  for(var t in tests) {
   var val = this.get(t, tests[t]);
   if (val) {
    if (t === 'field_fb_id') return 'https://graph.facebook.com/' + val + '/picture?width=70&height=70&redirect=true';
    if (tests[t] === 'avatar' || t === 'field_avatar') {
     return Config.api.base+'/themes/custom/tam/images/avatars/black/' + val + '.png';
    }
    return val;
   }
  }
  return false;
 }

 getAvatarPath(tests, hue) {
  for(var t in tests) {
   if (tests[t] === 'avatar' || t === 'field_avatar') {
    var val = this.get(t, tests[t]);
    if (val) {
     return Config.api.base+'/themes/custom/tam/images/avatars/'+(hue === 'light' ? 'black' : 'white')+'/' + val + '.png';
    }
   }
  }
  return false;
 }

 canEdit(me) { // only receives profile
  if (!me || !me.uid) return false;

  var type = this.get('type', 'target_id');
  if (type === 'default' || type === 'user') {
   if (me.uid[0].value === this.get('uid', 'value')) {
    return true;
   }
  } else if (type === 'groups-group_membership') {
   if (me.uid[0].value === this.get('entity_id', 'target_id')) {
    return true;
   }
  } else {
   if (me.uid[0].value === this.get('uid', 'target_id')) {
    return true;
   }
   return (this.findPropVal('field_editors', me.uid[0].value, 'target_id') > 0);
  }
  return false;
 }

 isGroupAdmin(me) { // receives full auth obj
  if (!me || !me.profile || !me.groups) return false;
  var type = this.get('type', 'target_id'), gid = false;
  if (type === 'groups') {
   gid = this.json.id[0].value;
  } else {
   gid = this.json.gid[0].target_id;
  }

  if (!gid) {
   console.log("NO GROUP CONTEXT on isGroupAdmin");
   return false;
  }

  if (typeof me.groups[gid] === 'undefined') return false;

  var gjson = this;
  if (type !== 'groups') {
   gjson = new Drupal2Json(me.groups[gid]);
  }

  const uid = me.profile.uid[0].value;
  if (gjson.get('uid', 'target_id') === uid) return true; // is group author

  return (gjson.findPropVal('field_editors', uid, 'target_id') > 0);
 }

}

export default Drupal2Json;
