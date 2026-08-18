import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FaceoffQuestsTab } from "@/components/play/FaceoffQuestsTab";
import {
  CPX_SURVEY_QUEST_ID,
  QUESTS,
} from "@/lib/affiliates";
import { CPX_SLUG } from "@/lib/postback";

test("Faceoff Quests opens only the pinned authenticated CPX survey path", () => {
  const surveyQuest = QUESTS.find(
    (quest) => quest.id === CPX_SURVEY_QUEST_ID,
  );
  assert.ok(surveyQuest);
  assert.equal(surveyQuest.pinSlug, CPX_SLUG);

  const html = renderToStaticMarkup(createElement(FaceoffQuestsTab));
  assert.match(html, /href="\/api\/go\/q-surveys"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, />Quests</);
  assert.doesNotMatch(html, /\$|\bVP\b|Freecash|bonus/i);
});
