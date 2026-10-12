package com.codepath.platform.dto;

import java.time.LocalDateTime;
import java.util.List;

public class LessonDto {

    public static class CodeExample {
        private String language;
        private String code;
        private String explanation;

        public CodeExample() {}
        public CodeExample(String language, String code, String explanation) {
            this.language = language;
            this.code = code;
            this.explanation = explanation;
        }

        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class TimeComplexity {
        private String best;
        private String average;
        private String worst;
        private String explanation;

        public TimeComplexity() {}
        public TimeComplexity(String best, String average, String worst, String explanation) {
            this.best = best;
            this.average = average;
            this.worst = worst;
            this.explanation = explanation;
        }

        public String getBest() { return best; }
        public void setBest(String best) { this.best = best; }
        public String getAverage() { return average; }
        public void setAverage(String average) { this.average = average; }
        public String getWorst() { return worst; }
        public void setWorst(String worst) { this.worst = worst; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class PracticeQuestion {
        private String title;
        private String problemStatement;
        private String difficulty;
        private String sampleInput;
        private String sampleOutput;
        private String expectedSolutionOutline;

        public PracticeQuestion() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getProblemStatement() { return problemStatement; }
        public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getSampleInput() { return sampleInput; }
        public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
        public String getSampleOutput() { return sampleOutput; }
        public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
        public String getExpectedSolutionOutline() { return expectedSolutionOutline; }
        public void setExpectedSolutionOutline(String expectedSolutionOutline) { this.expectedSolutionOutline = expectedSolutionOutline; }
    }

    public static class LessonResponse {
        private Long id;
        private Long topicId;
        private String theory;
        private String algorithm;
        private Object codeExamples;
        private Object timeComplexity;
        private String spaceComplexity;
        private Object practiceQuestions;
        private LocalDateTime generatedAt;
        private Integer contentVersion;
        private boolean isCached;
        private String source;

        public LessonResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getTopicId() { return topicId; }
        public void setTopicId(Long topicId) { this.topicId = topicId; }
        public String getTheory() { return theory; }
        public void setTheory(String theory) { this.theory = theory; }
        public String getAlgorithm() { return algorithm; }
        public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
        public Object getCodeExamples() { return codeExamples; }
        public void setCodeExamples(Object codeExamples) { this.codeExamples = codeExamples; }
        public Object getTimeComplexity() { return timeComplexity; }
        public void setTimeComplexity(Object timeComplexity) { this.timeComplexity = timeComplexity; }
        public String getSpaceComplexity() { return spaceComplexity; }
        public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
        public Object getPracticeQuestions() { return practiceQuestions; }
        public void setPracticeQuestions(Object practiceQuestions) { this.practiceQuestions = practiceQuestions; }
        public LocalDateTime getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
        public Integer getContentVersion() { return contentVersion; }
        public void setContentVersion(Integer contentVersion) { this.contentVersion = contentVersion; }
        public boolean isCached() { return isCached; }
        public void setCached(boolean cached) { isCached = cached; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
    }
}
