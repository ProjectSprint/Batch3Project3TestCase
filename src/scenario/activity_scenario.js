import { isActivity } from "../caster/caster.js";
import { isEqual, isEqualWith, isEveryItemDifferent, isExists, isTotalDataInRange, isValidDate, traverseObject } from "../helper/assertion.js";
import { combine, generateRandomName, generateRandomNumber, withProbability } from "../helper/generator.js";
import { testDeleteAssert, testGetAssert, testPatchJsonAssert, testPostJsonAssert } from "../helper/request.js";

/** @type {Object<string, number>} */
const activitiesCalories = {
  Walking: 4,
  Yoga: 4,
  Stretching: 4,
  Cycling: 8,
  Swimming: 8,
  Dancing: 8,
  Hiking: 10,
  Running: 10,
  HIIT: 10,
  JumpRope: 10
};
const activityTypes = ["Walking", "Yoga", "Stretching", "Cycling",
  "Swimming", "Dancing", "Hiking", "Running",
  "HIIT", "JumpRope",
]
/**
 * @param {User} user
 * @param {number} totalData
 * @param {import("../types/config.d.ts").Config} config
  * @returns {Activity[]}
 */
export function doGetActivity(config, user, totalData) {
  const featureName = "Get Activity";
  const route = config.baseUrl + "/v1/activity";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  /** @type {import("k6").Checkers<any>} */
  const baseChecks = {
    ["should return 200"]: (v) => v.status === 200,
    ["should have activityId"]: (v) => isExists(v, "[]activityId", ["string"]),
    ["should have activityType"]: (v) => isExists(v, "[]activityType", ["string"]),
    ["should have doneAt"]: (v) => isEqualWith(v, "[]doneAt", (a) => a.every(b => b && isValidDate(b.toString()))),
    ["should have createdAt"]: (v) => isEqualWith(v, "[]createdAt", (a) => a.every(b => b && isValidDate(b.toString()))),
    ["should have durationInMinutes"]: (v) => isExists(v, "[]durationInMinutes", ["number"]),
    ["should have caloriesBurned"]: (v) => isExists(v, "[]caloriesBurned", ["number"]),
  }
  const activities = []
  const result = assertHandler("valid payload with pagination", featureName, route,
    { limit: totalData, offset: 0 },
    positiveHeader,
    combine(baseChecks, {
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
    }),
    config, {});
  if (result.isSuccess) {
    const jsonResult = result.res.json()
    if (Array.isArray(jsonResult)) {
      activities.push(...jsonResult)
    }
  }
  withProbability(0.2, () => {
    const pagResult = assertHandler("valid payload with pagination offset", featureName, route,
      { limit: totalData, offset: totalData },
      positiveHeader,
      combine(baseChecks, {
        ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
      }),
      config,
      {},
    );
    if (pagResult.isSuccess) {
      const jsonResult = pagResult.res.json()
      if (Array.isArray(jsonResult)) {
        activities.push(...jsonResult)
      }
    }
    withProbability(0.2, () => {
      const pagOffResult = assertHandler("valid payload with pagination offset", featureName, route,
        { limit: totalData, offset: totalData * 2 },
        positiveHeader,
        combine(baseChecks, {
          ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
        }),
        config,
        {},
      );

      if (pagOffResult.isSuccess) {
        const jsonResult = pagOffResult.res.json()
        if (Array.isArray(jsonResult)) {
          activities.push(...jsonResult)
        }
      }
      const beforeTime = new Date()
      const currentHour = beforeTime.getHours()
      beforeTime.setHours(currentHour - 1)
      const oneHourAgo = beforeTime.toISOString()

      const afterTime = new Date()
      afterTime.setHours(currentHour + 1)
      const oneHourAfter = afterTime.toISOString()
      assertHandler("valid payload with doneAtFrom & doneAtTo", featureName, route,
        { doneAtTo: oneHourAfter, doneAtFrom: oneHourAgo },
        positiveHeader,
        combine(baseChecks, {
          ["should have doneAt in range"]: (v) => isEqualWith(v, "[]doneAt", (a) => a.every(b => b && beforeTime < new Date(b.toString()) && afterTime > new Date(b.toString()))),
        }),
        config, {},);
    })
  })

  return activities.every(a => isActivity(a)) ? activities : []
}

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
  * @returns {Activity|undefined}
 */
export function doPostActivity(config, user) {
  const featureName = "Post Activity";
  const route = config.baseUrl + "/v1/activity";
  const assertHandler = testPostJsonAssert;

  const duration = generateRandomNumber(2, 100)
  const choosenActivity = activityTypes[generateRandomNumber(0, activityTypes.length - 1)]
  const calorieBurned = duration * activitiesCalories[choosenActivity]
  const positivePayload = {
    activityType: choosenActivity,
    doneAt: new Date().toISOString(),
    durationInMinutes: duration,
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };


  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have activityId"]: (v) => isExists(v, "activityId", ["string"]),
      ["should have activityType"]: (v) => isExists(v, "activityType", ["string"]),
      ["should have doneAt"]: (v) => isEqualWith(v, "doneAt", (a) => a.every(b => b && isValidDate(b.toString()))),
      ["should have durationInMinutes"]: (v) => isExists(v, "durationInMinutes", ["number"]),
      ["should have caloriesBurned"]: (v) => isEqual(v, "caloriesBurned", calorieBurned),
      ["should have createdAt"]: (v) => isEqualWith(v, "createdAt", (a) => a.every(b => b && isValidDate(b.toString()))),
      ["should have updatedAt"]: (v) => isEqualWith(v, "updatedAt", (a) => a.every(b => b && isValidDate(b.toString()))),
    },
    [], config, {});
  withProbability(0.2, () => {
    const payload = combine(positivePayload, {
      durationInMinutes: -1
    })
    assertHandler("invalid payload", featureName, route, payload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      [], config, {});
  })
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isActivity(jsonResult)) {
        return jsonResult
      } else {
        console.log(featureName + " | json is not activity", jsonResult)
      }
    } catch (e) {
      console.log(featureName + " | failed to parse json", e)
    }
  }
  console.log(featureName + " | is not successs, response_code:", res.res.status, "payload", res.res.body)
}

/**
 * @param {User} user
 * @param {Activity} activity
 * @param {import("../types/config.d.ts").Config} config
 * @returns {Activity | undefined}
 */
export function doPatchActivity(config, user, activity) {
  const featureName = "Patch Activity";
  const routeWithoutId = config.baseUrl + "/v1/activity";
  const route = routeWithoutId + `/${activity.activityId}`;
  const assertHandler = testPatchJsonAssert;

  const duration = generateRandomNumber(1, 100)
  const choosenActivity = activityTypes[generateRandomNumber(0, activityTypes.length - 1)]
  const calorieBurned = duration * activitiesCalories[choosenActivity]
  const positivePayload = {
    activityType: choosenActivity,
    doneAt: new Date().toISOString(),
    durationInMinutes: duration,
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  withProbability(0.2, () => {
    const payload = combine(positivePayload, {
      durationInMinutes: -1
    })
    assertHandler("invalid payload", featureName, route, payload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      [], config, {});
  })
  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have activityId"]: (v) => isEqual(v, "activityId", activity.activityId),
      ["should have activityType"]: (v) => isEqual(v, "activityType", positivePayload.activityType),
      ["should have doneAt"]: (v) => isEqualWith(v, "doneAt", (a) => a.every(b => b && new Date(b.toString()).toISOString() == positivePayload.doneAt)),
      ["should have durationInMinutes"]: (v) => isEqual(v, "durationInMinutes", positivePayload.durationInMinutes),
      ["should have caloriesBurned"]: (v) => isEqual(v, "caloriesBurned", calorieBurned),
      ["should have createdAt"]: (v) => isEqualWith(v, "createdAt", (a) => a.every(b => b && isValidDate(b.toString()))),
      ["should have updatedAt"]: (v) => isEqualWith(v, "updatedAt", (a) => a.every(b => b && isValidDate(b.toString()))),
    },
    [], config, {}
  );
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isActivity(jsonResult)) {
        return jsonResult
      }
    } catch (e) {
      console.log(featureName + " | failed to parse json", e)
    }
  }
}


/**
 * @param {User} user
 * @param {Activity} activity
 * @param {import("../types/config.d.ts").Config} config
 */
export function doDeleteTest(config, user, activity) {
  const featureName = "Delete Activity";
  const routeWithoutId = config.baseUrl + "/v1/activity";
  const route = routeWithoutId + `/${activity.activityId}`;
  const assertHandler = testDeleteAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  withProbability(0.2, () => {
    assertHandler("invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, {});
  })
  assertHandler("valid payload", featureName, route, {}, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
    },
    config, {});
}
