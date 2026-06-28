import { Router, type IRouter } from "express";
import healthRouter from "./health";
import memoriesRouter from "./memories";
import notesRouter from "./notes";
import subjectsRouter from "./subjects";
import assignmentsRouter from "./assignments";
import examsRouter from "./exams";
import achievementsRouter from "./achievements";
import projectsRouter from "./projects";
import bucketlistRouter from "./bucketlist";
import friendsRouter from "./friends";
import journalRouter from "./journal";
import moodRouter from "./mood";
import futureLettersRouter from "./future-letters";
import statsRouter from "./stats";
import semestersRouter from "./semesters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(memoriesRouter);
router.use(notesRouter);
router.use(subjectsRouter);
router.use(assignmentsRouter);
router.use(examsRouter);
router.use(achievementsRouter);
router.use(projectsRouter);
router.use(bucketlistRouter);
router.use(friendsRouter);
router.use(journalRouter);
router.use(moodRouter);
router.use(futureLettersRouter);
router.use(statsRouter);
router.use(semestersRouter);

export default router;
