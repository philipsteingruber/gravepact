import type { SkillCard, SkillOutput, SupportCard, SupportModification } from "@/lib/types";

export const filterCompatibleMods = ({
  skill,
  supports,
}: {
  skill: SkillCard;
  supports: SupportCard[];
}): SupportModification[] => {
  const skillTags = new Set(skill.tags);

  return supports
    .filter((support) =>
      support.compatibleTags.some((tag) => {
        return skillTags.has(tag);
      }),
    )
    .map((support) => support.effect);
};

export const resolveSupports = ({
  output,
  mods,
}: {
  output: SkillOutput;
  mods: SupportModification[];
}): SkillOutput => {
  const result = { ...output };

  mods.forEach((mod) => {
    if (mod.kind === "multiplicative") {
      result.damage *= mod.multiplier;
    } else if (mod.kind === "additive") {
      result.statuses = [...result.statuses, { kind: mod.statusEffect, stacks: mod.stacks }];
    } else {
      // TODO: Handle other kinds
    }
  });
  return result;
};
