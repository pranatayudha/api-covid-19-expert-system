const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const {
  jenisAgunanPokok,
  formatTerbilang,
  stringValid,
  jenisAgunanTambahan,
} = require('../../utils/global');

const compile = (templateName = '', data) => {
  try {
    const filePath = path.join(
      process.cwd(),
      'bin/infra/templates',
      `${templateName}.hbs`
    );

    handlebars.registerHelper('__numberFormat', (_value) => {
      return new Intl.NumberFormat('ID').format(_value);
    });

    handlebars.registerHelper('__increment', (_value) => {
      return parseInt(_value) + 1;
    });

    handlebars.registerHelper('__jenisAgunanPokok', (_value) => {
      return jenisAgunanPokok(_value);
    });

    handlebars.registerHelper('__jenisAgunanTambahan', (_value) => {
      return jenisAgunanTambahan(_value);
    });

    handlebars.registerHelper('__formatTerbilang', (_value) => {
      return stringValid(formatTerbilang(_value));
    });

    handlebars.registerHelper('__ifCodeTable', function (_value, options) {
      if (_value == '2' || _value == '3') return options.fn(this); // CV || PT
      return options.inverse(this); // Individual && PARI
    });

    handlebars.registerHelper('__ifIndividual', function (_value, options) {
      if (_value == '1') return options.fn(this);
      return options.inverse(this);
    });

    handlebars.registerHelper('__ifCV', function (_value, options) {
      if (_value == '2') return options.fn(this);
      return options.inverse(this);
    });

    handlebars.registerHelper('__ifPT', function (_value, options) {
      if (_value == '3') return options.fn(this);
      return options.inverse(this);
    });

    handlebars.registerHelper('__ifPari', function (_value, options) {
      if (_value == '4') return options.fn(this);
      return options.inverse(this);
    });

    const html = fs.readFileSync(filePath, 'utf-8');
    return handlebars.compile(html)(data);
  } catch (_) {
    throw new Error('template not found, please contact helpdesk!');
  }
};

module.exports = {
  compile,
};
