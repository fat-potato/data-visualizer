const fetch = require("cross-fetch");
const { response } = require("express");
const {
  checkProperties,
  transformData,
  checkEmptyProperties,
  getDuplicatedUsers,
} = require("./util");

const EXTRERNAL_URL =
  "https://secure.bulknutrients.com.au/content/bEzWsxcHPewMt/sampledata.json";

let ORIGINAL = [];
let PROCESSED = [];

const getExternalData = async (req, res = response) => {
  try {
    const resp = await fetch(`${EXTRERNAL_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (resp.status >= 400) {
      throw new Error("Bad response from server");
    }

    const data = await resp.json();
    ORIGINAL = data;
    PROCESSED = processData(ORIGINAL);

    // res.json({ data: ORIGINAL, count: ORIGINAL.length });
  } catch (err) {
    console.error(err);
  }
};

const getData = async (req, res = response) => {
  try {
    res.json({ data: PROCESSED, count: PROCESSED.length });
  } catch (err) {
    console.error(err);
  }
};

// group all data into products
const getProductGroups = async (req, res = response) => {
  const arr = [];
  const groups = PROCESSED.reduce((groups, item) => {
    const group = groups[item.sample.sku] || [];
    group.push(item);
    groups[item.sample.sku] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      sku: `${key}`,
      groupName: `${value[0].sample.product}`,
      orders: value,
      count: value.length,
    });
  }

  res.json(arr);
};

// group all data into state
const getStateGroups = async (req, res = response) => {
  const arr = [];
  const groups = PROCESSED.reduce((groups, item) => {
    const group = groups[item.state] || [];
    group.push(item);
    groups[item.state] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      groupName: `${key}`,
      orders: value,
      count: value.length,
    });
  }

  res.json(arr);
};

// group all data into flavours
const getFlavourGroups = async (req, res = response) => {
  const arr = [];
  const groups = PROCESSED.reduce((groups, item) => {
    const group = groups[item.sample.flavour] || [];
    group.push(item);
    groups[item.sample.flavour] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      groupName: `${key}`,
      orders: value,
      count: value.length,
    });
  }

  res.json(arr);
};

// group all data into day of week
const getDayGroups = async (req, res = response) => {
  const arr = [];
  const groups = PROCESSED.reduce((groups, item) => {
    const group = groups[item.dayOfWeek] || [];
    group.push(item);
    groups[item.dayOfWeek] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      groupName: `${key}`,
      orders: value,
      count: value.length,
    });
  }

  res.json(arr);
};

// group all data into products then order by count
const getMostPopular = async (req, res = response) => {
  const arr = [];
  const groups = PROCESSED.reduce((groups, item) => {
    const group = groups[item.sample.sku] || [];
    group.push(item);
    groups[item.sample.sku] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      sku: `${key}`,
      groupName: value[0].sample.product,
      orders: value,
      count: value.length,
    });
  }

  arr.sort(function (a, b) {
    var keyA = a.count,
      keyB = b.count;
    // Compare the 2 counts
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  res.json(arr);
};

// get duplicates
const getDuplicates = async (req, res = response) => {
  const users = getDuplicatedUsers();
  const arr = [];
  const groups = users.reduce((groups, item) => {
    const group = groups[item.fullName] || [];
    group.push(item);
    groups[item.fullName] = group;
    return groups;
  }, {});

  for (const [key, value] of Object.entries(groups)) {
    arr.push({
      username: `${key}`,
      orders: value,
      count: value.length,
    });
  }

  res.json(arr);
};

// get statistics
const getStats = async (req, res = response) => {
  const users = getDuplicatedUsers();
  const groups = users.reduce((groups, item) => {
    const group = groups[item.fullName] || [];
    group.push(item);
    groups[item.fullName] = group;
    return groups;
  }, {});

  const duplicatesRemoved = users.length - Object.keys(groups).length;
  const defected = ORIGINAL.length - PROCESSED.length - duplicatesRemoved;
  const stats = {
    totalRequests: ORIGINAL.length,
    totalCleanedRequests: PROCESSED.length,
    duplicatesRemoved: duplicatesRemoved,
    defected: defected,
  };

  res.json(stats);
};

const processData = (data) => {
  // check for missing properties in original data
  // check for empty properties in original data
  // transform original data into the needed format
  let newData = transformData(checkEmptyProperties(checkProperties(data)));

  return newData;
};

module.exports = {
  getExternalData,
  getProductGroups,
  getStateGroups,
  getDayGroups,
  getFlavourGroups,
  getMostPopular,
  getDuplicates,
  getData,
  getStats,
};
