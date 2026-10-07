import { LearningCourse } from '../types';
import { PYTHON_COURSE as FULL_PYTHON_COURSE } from '../curriculum/python/pythonCourse';
import { buildPythonFoundationsUnit } from '../curriculum/python/foundations';

export const PYTHON_COURSE: LearningCourse = {
  ...FULL_PYTHON_COURSE,
  units: [
    buildPythonFoundationsUnit(),
    ...FULL_PYTHON_COURSE.units.slice(1)
  ]
};
