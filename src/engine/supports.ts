import { assertNever } from "@/lib/assert-never";
import type { SkillCard, SkillOutput, SupportCard, SupportModification } from "@/lib/types";

export const filterCompatibleMods = ({ skill, supports }: { skill: SkillCard; supports: SupportCard[] }): SupportModification[] => {
  const skillTags = new Set(skill.tags);

  return supports
    .filter((support) =>
      support.compatibleTags.some((tag) => {
        return skillTags.has(tag);
      }),
    )
    .map((support) => support.effect);
};


export const resolveSupports = ({ skillOutput, mods }: { skillOutput: SkillOutput; mods: SupportModification[] }): SkillOutput => {
  const result = { ...skillOutput };

  mods.forEach((mod) => {
    if (mod.kind === "multiplicative") {
      result.damage *= mod.multiplier;
    } else if (mod.kind === "additive") {
      result.statuses = [...result.statuses, { kind: mod.statusEffect, stacks: mod.stacks }];
    } else if (mod.kind === "reduceCost" || mod.kind === "changeBehavior") {
      // TODO: Handle other kinds
    } else {
      assertNever(mod);
    }
  });
  return result;
};
