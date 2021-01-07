import moment from 'moment';

class Form2Json {

    getBundle(field) {
      var target = null;
      if (field.settings.target_type) target = field.settings.target_type;
      if (field.settings.handler_settings) {
        if (field.settings.handler_settings.target_bundles && field.settings.handler_settings.target_bundles[0]) target = field.settings.handler_settings.target_bundles[0];
        else if (field.settings.handler_settings.target_bundles && field.settings.handler_settings.target_bundles['groups-group_membership']) target = field.settings.handler_settings.target_bundles['groups-group_membership'];
        else if (field.settings.handler_settings.target_bundles && field.settings.handler_settings.target_bundles['genres']) target = field.settings.handler_settings.target_bundles['genres'];
      }
      return target;
    }

    getPlaceholder(field) {
      var p = '';
      if (field.placeholder) p = field.placeholder;
      else if (field.label) p =  field.label;
      else if (field.description) p =  field.description;
      return p;
    }

    settingsToProps(field, entry, index) {
      // create HTML attributes of field and settings
      var obj = {};
      // obj.variant = 'outlined'; // filled
      obj.name = field.field_name;

      if (field.settings) {
        var inputProps = false;
        var props = {'min':'min', 'max':'max', 'max_length':'maxLength', 'required':'required',  // 'scale':'step' (makes 7 invalid as number input)
          'aria-describedby':'aria-describedby','data-propname':'data-propname'};
        for(var p in props) {
          if (typeof field.settings[p] !== 'undefined' && field.settings[p] !== null) {
            if (inputProps === false) inputProps = {};
            inputProps[props[p]] = field.settings[p];
          }
        }
        if (field.type === 'decimal') {
          // inputProps[props[p]] = (p === 'scale') ? parseFloat(field.settings.scale) : field.settings[p];
          if (inputProps === false) inputProps = {};
          inputProps.step = 'any';
        }

        if (typeof inputProps === 'object') {
          obj.inputProps = inputProps;
        }

        if (field.settings.display_summary === true) {
          obj['multiline'] = true;
          obj['rows'] = 2;
        }
      }
      if (field.required || field['#required'] === true) {
        obj.required = true;
      }
      if (field.widget && field.widget[index] && field.widget['#required']) {
        obj.required = field.widget[index]['#required'];
      }

      obj.placeholder = this.getPlaceholder(field);
      return obj;
    }

    getDefaultValue(field, entry, index) {
      var propname = field['data-propname'];
      if (entry && typeof entry[index] !== 'undefined' && typeof entry[index][propname] !== 'undefined') {
        return (entry[index][propname] === null) ? '' : entry[index][propname];
      } else if (typeof field.default_value === 'string' || typeof field.default_value === 'number') {
        return field.default_value;
      } else if (field.default_value === null) {
        return '';
      } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' &&  typeof field.default_value[index][propname] !== 'undefined') {
        return field.default_value[index][propname];
      } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' && typeof field.default_value[index]['default_date'] !== 'undefined' && field.default_value[index]['default_date'] === 'now') {
        return moment().format('');
      }
      return '';
    }

}

export default (new Form2Json()); // singleton
