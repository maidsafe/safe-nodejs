var assert = require('assert');

const { new_safe } = require('./helpers.js');

describe('NRS API', function() {
  let safe = new_safe();
  let filesContainer = safe.files_container_create("test/testfolder/", "", false, false);
  let filesContainerXorUrl = filesContainer[0];
  let filesMap = filesContainer[2];

  it('Create an NRS name', function() {
    let random = Math.floor(Math.random() * Math.floor(1000));
    let nrsName = `safe://pubname-${random}`;
    let nrsMapData = safe.nrs_map_container_create(nrsName, `${filesContainerXorUrl}?v=0`, true, false, false);

    assert.equal(Object.keys(nrsMapData[1]).length, 1);

    nrsMapData = safe.nrs_map_container_get(nrsName);
    assert.equal(nrsMapData[1].default.OtherRdf.link, `${filesContainerXorUrl}?v=0`);
  });

  it('Add a subname to an NRS name', function() {
    let random = Math.floor(Math.random() * Math.floor(1000));
    let nrsName = `safe://pubname-${random}`;
    let nrsMapData = safe.nrs_map_container_create(nrsName, `${filesContainerXorUrl}?v=0`, true, false, false);

    let nrsSubName = `safe://subname.pubname-${random}`;
    nrsMapData = safe.nrs_map_container_add(nrsSubName, `${filesContainerXorUrl}/test.md?v=0`, false, false, false);

    let fetchedTxt = safe.fetch(nrsName);
    assert.equal(fetchedTxt.FilesContainer.files_map['/test.txt'].link, filesMap['/test.txt'].link);
    let fetchedMd = safe.fetch(nrsSubName);
    assert.equal("hello test.md!\n", String.fromCharCode.apply(null, new Uint8Array(fetchedMd.PublishedImmutableData.data)));
  });

  it('Remove a subname from an NRS name', function() {
    let random = Math.floor(Math.random() * Math.floor(1000));
    let nrsName = `safe://pubname-${random}`;
    safe.nrs_map_container_create(nrsName, `${filesContainerXorUrl}?v=0`, true, false, false);
    let nrsMapData = safe.nrs_map_container_get(nrsName);
    assert.equal(Object.keys(nrsMapData[1].sub_names_map).length, 0);

    let nrsSubName = `safe://subname.pubname-${random}`;
    safe.nrs_map_container_add(nrsSubName, `${filesContainerXorUrl}/test.md?v=0`, false, false, false);
    nrsMapData = safe.nrs_map_container_get(nrsName);
    assert.equal(Object.keys(nrsMapData[1].sub_names_map).length, 1);

    safe.nrs_map_container_remove(nrsSubName, false);
    nrsMapData = safe.nrs_map_container_get(nrsName);
    assert.equal(Object.keys(nrsMapData[1].sub_names_map).length, 0);
  });
});
