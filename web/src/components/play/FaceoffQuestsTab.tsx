import { CPX_SURVEY_QUEST_ID } from "@/lib/affiliates";

export function FaceoffQuestsTab() {
  return (
    <a
      href={`/api/go/${CPX_SURVEY_QUEST_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="vq-faceoff__quests-tab"
    >
      Quests
    </a>
  );
}
