import { MisconceptionTag } from '../../../types/question';
import { ConceptRepairDrill } from './types';
import { assignmentVsComparisonDrill } from './assignmentVsComparison';
import { stringVsNumberDrill } from './stringVsNumber';
import { inputIsStringDrill } from './inputIsString';
import { conditionBoundaryDrill } from './conditionBoundary';
import { precedenceConfusionDrill } from './precedenceConfusion';
import { variableValueConfusionDrill } from './variableValueConfusion';
import { syntaxErrorDrill } from './syntaxError';
import { indentationErrorDrill } from './indentationError';
import { wrongOperatorDrill } from './wrongOperator';
import { booleanLogicConfusionDrill } from './booleanLogicConfusion';
import { wrongTypeDrill } from './wrongType';

export * from './types';

export const REPAIR_DRILLS: Record<MisconceptionTag, ConceptRepairDrill> = {
  ASSIGNMENT_VS_COMPARISON: assignmentVsComparisonDrill,
  STRING_VS_NUMBER: stringVsNumberDrill,
  INPUT_IS_STRING: inputIsStringDrill,
  CONDITION_BOUNDARY: conditionBoundaryDrill,
  PRECEDENCE_CONFUSION: precedenceConfusionDrill,
  VARIABLE_VALUE_CONFUSION: variableValueConfusionDrill,
  SYNTAX_ERROR: syntaxErrorDrill,
  INDENTATION_ERROR: indentationErrorDrill,
  WRONG_OPERATOR: wrongOperatorDrill,
  BOOLEAN_LOGIC_CONFUSION: booleanLogicConfusionDrill,
  WRONG_TYPE: wrongTypeDrill,
  // Fallbacks for auxiliary tags
  OFF_BY_ONE: conditionBoundaryDrill,
  LOOP_EXECUTION_CONFUSION: conditionBoundaryDrill
};

export const ALL_REPAIR_DRILLS: ConceptRepairDrill[] = [
  assignmentVsComparisonDrill,
  stringVsNumberDrill,
  inputIsStringDrill,
  conditionBoundaryDrill,
  precedenceConfusionDrill,
  variableValueConfusionDrill,
  syntaxErrorDrill,
  indentationErrorDrill,
  wrongOperatorDrill,
  booleanLogicConfusionDrill,
  wrongTypeDrill
];

export const getRepairDrillByTag = (tag: string): ConceptRepairDrill => {
  const normalizedTag = (tag.toUpperCase().replace(/\s+/g, '_')) as MisconceptionTag;
  return REPAIR_DRILLS[normalizedTag] || REPAIR_DRILLS.ASSIGNMENT_VS_COMPARISON;
};
