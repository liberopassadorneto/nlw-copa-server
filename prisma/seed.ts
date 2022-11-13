import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "johndoe@email.com",
      avatarUrl:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
  });

  const pool = await prisma.pool.create({
    data: {
      title: "My first pool",
      code: "BRU123",
      ownerId: user.id,

      participants: {
        create: { userId: user.id },
      },
    },
  });

  // const participant = await prisma.participant.create({
  //   data: {
  //     userId: user.id,
  //     poolId: pool.id,
  //   },
  // });

  await prisma.game.create({
    data: {
      date: "2022-11-06T12:52:32.592Z",
      firstTeamCountryCode: "DE",
      secondTeamCountryCode: "FR",
    },
  });

  await prisma.game.create({
    data: {
      date: "2022-11-08T12:52:32.592Z",
      firstTeamCountryCode: "BR",
      secondTeamCountryCode: "AR",

      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              },
            },
          },
        },
      },
    },
  });
}

main();
