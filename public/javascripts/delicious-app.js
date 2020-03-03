import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

autocomplete($('#address'), $('#lat'), $('#lng'));

$('#address').on('keydown'), e => {
  if (e.keyCode === 13) {
    e.preventDefault();
  }
}
