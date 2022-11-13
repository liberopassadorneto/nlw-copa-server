import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  // Criar um palpite para um jogo especifico (que está vinculado a um bolão)
  fastify.post(
    "/pools/:poolId/games/:gameId/guesses",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { poolId, gameId } = createGuessParams.parse(request.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            userId: request.user.sub,
            poolId,
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({
          message: "Participant is not allowed to create a guess in this pool",
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          gameId_participantId: {
            gameId,
            participantId: participant.id,
          },
        },
      });

      if (guess) {
        return reply.status(400).send({
          message: "Participant already created a guess for this game",
        });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return reply.status(404).send({
          message: "Game not found",
        });
      }

      if (game.date < new Date()) {
        return reply.status(400).send({
          message: "Game already started",
        });
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return reply.status(201).send();
    }
  );
}
