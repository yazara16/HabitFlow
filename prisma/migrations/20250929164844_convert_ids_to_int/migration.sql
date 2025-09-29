/*
  Warnings:

  - The primary key for the `achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `achievements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `devices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `devices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `goals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `habit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `habit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `habit_overrides` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `habit_overrides` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `habits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `habits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoryId` column on the `habits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `progress_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `progress_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `habitId` column on the `progress_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goalId` column on the `progress_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `reminders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `reminders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `habitId` column on the `reminders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `streak_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `streak_records` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `habitId` column on the `streak_records` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `themes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `themes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user_achievements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `weekly_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `weekly_reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `goals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `habitId` on the `habit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `habit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `habitId` on the `habit_overrides` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `habit_overrides` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `habits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `progress_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `reminders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `streak_records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `themes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_achievements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `achievementId` on the `user_achievements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `weekly_reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."categories" DROP CONSTRAINT "categories_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."devices" DROP CONSTRAINT "devices_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."goals" DROP CONSTRAINT "goals_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_logs" DROP CONSTRAINT "habit_logs_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_logs" DROP CONSTRAINT "habit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_overrides" DROP CONSTRAINT "habit_overrides_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habit_overrides" DROP CONSTRAINT "habit_overrides_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_entries" DROP CONSTRAINT "progress_entries_goalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_entries" DROP CONSTRAINT "progress_entries_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress_entries" DROP CONSTRAINT "progress_entries_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reminders" DROP CONSTRAINT "reminders_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reminders" DROP CONSTRAINT "reminders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."streak_records" DROP CONSTRAINT "streak_records_habitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."streak_records" DROP CONSTRAINT "streak_records_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."themes" DROP CONSTRAINT "themes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_achievements" DROP CONSTRAINT "user_achievements_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_achievements" DROP CONSTRAINT "user_achievements_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_settings" DROP CONSTRAINT "user_settings_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."weekly_reports" DROP CONSTRAINT "weekly_reports_userId_fkey";

-- AlterTable
ALTER TABLE "public"."achievements" DROP CONSTRAINT "achievements_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."categories" DROP CONSTRAINT "categories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."devices" DROP CONSTRAINT "devices_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "devices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."goals" DROP CONSTRAINT "goals_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."habit_logs" DROP CONSTRAINT "habit_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "habitId",
ADD COLUMN     "habitId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."habit_overrides" DROP CONSTRAINT "habit_overrides_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "habitId",
ADD COLUMN     "habitId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "habit_overrides_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."habits" DROP CONSTRAINT "habits_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER,
ADD CONSTRAINT "habits_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."progress_entries" DROP CONSTRAINT "progress_entries_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "habitId",
ADD COLUMN     "habitId" INTEGER,
DROP COLUMN "goalId",
ADD COLUMN     "goalId" INTEGER,
ADD CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."reminders" DROP CONSTRAINT "reminders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "habitId",
ADD COLUMN     "habitId" INTEGER,
ADD CONSTRAINT "reminders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."streak_records" DROP CONSTRAINT "streak_records_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "habitId",
ADD COLUMN     "habitId" INTEGER,
ADD CONSTRAINT "streak_records_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."themes" DROP CONSTRAINT "themes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "themes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."user_achievements" DROP CONSTRAINT "user_achievements_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "achievementId",
ADD COLUMN     "achievementId" INTEGER NOT NULL,
ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."user_settings" DROP CONSTRAINT "user_settings_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."weekly_reports" DROP CONSTRAINT "weekly_reports_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_logs" ADD CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_logs" ADD CONSTRAINT "habit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_overrides" ADD CONSTRAINT "habit_overrides_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_overrides" ADD CONSTRAINT "habit_overrides_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_reports" ADD CONSTRAINT "weekly_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_entries" ADD CONSTRAINT "progress_entries_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_records" ADD CONSTRAINT "streak_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streak_records" ADD CONSTRAINT "streak_records_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."themes" ADD CONSTRAINT "themes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
