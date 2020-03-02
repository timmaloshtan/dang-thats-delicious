function autocomplete(input, latInput, lngInput) {
  console.log('input :', input);
  console.log('latInput :', latInput);
  console.log('lngInput :', lngInput);
  if (!input) {
    return;
  }
  const dropdown = new google.maps.places.Autocomplete(input);
}

export default autocomplete;