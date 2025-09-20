const parseRequestParams = (search_params: URLSearchParams) => {
  const paramsObject = Object.fromEntries(search_params.entries()) as Record<string, any>;

  if (paramsObject.filter) {
    const filterObject: Record<string, any> = {};

    const filterEntries = paramsObject.filter.split(":");

    if (filterEntries.length === 2) {
      filterObject[filterEntries[0]] = filterEntries[1];
    }

    paramsObject.filter = filterObject;
  }

  return paramsObject;
};

export default parseRequestParams;
