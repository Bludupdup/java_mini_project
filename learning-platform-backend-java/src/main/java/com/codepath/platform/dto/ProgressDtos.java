package com.codepath.platform.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ProgressDtos {

    public static class UpdateProgressRequest {
        @NotNull(message = "topicId is required")
        private Long topicId;
        private Boolean theoryCompleted;
        private Boolean codeCompleted;
        private String status;

        public UpdateProgressRequest() {}

        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }
        public Boolean getTheoryCompleted() { return theoryCompleted; }
        public void setTheoryCompleted(Boolean theoryCompleted) { this.theoryCompleted = theoryCompleted; }
        public Boolean getCodeCompleted() { return codeCompleted; }
        public void setCodeCompleted(Boolean codeCompleted) { this.codeCompleted = codeCompleted; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class RecordAttemptRequest {
        @NotNull(message = "practiceProblemId is required")
        private Long practiceProblemId;

        @NotNull(message = "attemptStatus is required")
        private String attemptStatus; // SOLVED, ATTEMPTED, REVISIT

        private String verificationStatus = "SELF_REPORTED"; // SELF_REPORTED, VERIFIED
        private String notes;

        public RecordAttemptRequest() {}

        public Long getPracticeProblemId() { return practiceProblemId; }
        public void setPracticeProblemId(Long practiceProblemId) { this.practiceProblemId = practiceProblemId; }
        public String getAttemptStatus() { return attemptStatus; }
        public void setAttemptStatus(String attemptStatus) { this.attemptStatus = attemptStatus; }
        public String getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PracticeStatsDto {
        private long totalSolved;
        private long verifiedSolved;
        private long selfReportedSolved;

        public PracticeStatsDto(long totalSolved, long verifiedSolved, long selfReportedSolved) {
            this.totalSolved = totalSolved;
            this.verifiedSolved = verifiedSolved;
            this.selfReportedSolved = selfReportedSolved;
        }

        public long getTotalSolved() { return totalSolved; }
        public long getVerifiedSolved() { return verifiedSolved; }
        public long getSelfReportedSolved() { return selfReportedSolved; }
    }

    public static class DashboardSummaryDto {
        private long totalTopics;
        private long completedTopics;
        private long inProgressTopics;
        private long notStartedTopics;
        private int overallPercentage;
        private PracticeStatsDto practiceStats;
        private Object continueLearning;

        public DashboardSummaryDto() {}

        public long getTotalTopics() { return totalTopics; }
        public void setTotalTopics(long totalTopics) { this.totalTopics = totalTopics; }
        public long getCompletedTopics() { return completedTopics; }
        public void setCompletedTopics(long completedTopics) { this.completedTopics = completedTopics; }
        public long getInProgressTopics() { return inProgressTopics; }
        public void setInProgressTopics(long inProgressTopics) { this.inProgressTopics = inProgressTopics; }
        public long getNotStartedTopics() { return notStartedTopics; }
        public void setNotStartedTopics(long notStartedTopics) { this.notStartedTopics = notStartedTopics; }
        public int getOverallPercentage() { return overallPercentage; }
        public void setOverallPercentage(int overallPercentage) { this.overallPercentage = overallPercentage; }
        public PracticeStatsDto getPracticeStats() { return practiceStats; }
        public void setPracticeStats(PracticeStatsDto practiceStats) { this.practiceStats = practiceStats; }
        public Object getContinueLearning() { return continueLearning; }
        public void setContinueLearning(Object continueLearning) { this.continueLearning = continueLearning; }
    }
}
